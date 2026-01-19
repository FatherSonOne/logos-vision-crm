import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import type { FilterCondition, FilterField, FilterOperator } from '../filterTypes';
import { getOperatorsForType, OPERATOR_LABELS, OPERATOR_ICONS, operatorNeedsValue, operatorNeedsTwoValues } from '../filterTypes';

interface FilterRowProps {
  condition: FilterCondition;
  availableFields: FilterField[];
  onChange: (condition: FilterCondition) => void;
  onRemove: () => void;
}

export function FilterRow({ condition, availableFields, onChange, onRemove }: FilterRowProps) {
  const [fieldSearch, setFieldSearch] = useState('');

  const selectedField = useMemo(
    () => availableFields.find(f => f.id === condition.fieldId),
    [availableFields, condition.fieldId]
  );

  const availableOperators = useMemo(
    () => selectedField ? getOperatorsForType(selectedField.type) : [],
    [selectedField]
  );

  const filteredFields = useMemo(() => {
    if (!fieldSearch) return availableFields;
    return availableFields.filter(field =>
      field.label.toLowerCase().includes(fieldSearch.toLowerCase()) ||
      field.id.toLowerCase().includes(fieldSearch.toLowerCase())
    );
  }, [availableFields, fieldSearch]);

  const handleFieldChange = (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId);
    if (!field) return;

    const newOperators = getOperatorsForType(field.type);
    const newOperator = newOperators.includes(condition.operator as any)
      ? condition.operator
      : newOperators[0];

    onChange({
      ...condition,
      fieldId,
      operator: newOperator as FilterOperator,
      value: getDefaultValue(field),
      value2: undefined,
    });
  };

  const handleOperatorChange = (operator: FilterOperator) => {
    onChange({
      ...condition,
      operator,
      value: operatorNeedsValue(operator) ? condition.value : undefined,
      value2: undefined,
    });
  };

  const handleValueChange = (value: any) => {
    onChange({ ...condition, value });
  };

  const handleValue2Change = (value2: any) => {
    onChange({ ...condition, value2 });
  };

  const needsValue = operatorNeedsValue(condition.operator);
  const needsTwoValues = operatorNeedsTwoValues(condition.operator);

  return (
    <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group">
      {/* Field Selector */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-gray-700 mb-1">Field</label>
        <div className="relative">
          <select
            value={condition.fieldId}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            aria-label="Select field"
          >
            <option value="">Select field...</option>
            {availableFields.map(field => (
              <option key={field.id} value={field.id}>
                {field.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Operator Selector */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-medium text-gray-700 mb-1">Operator</label>
        <select
          value={condition.operator}
          onChange={(e) => handleOperatorChange(e.target.value as FilterOperator)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          disabled={!selectedField}
          aria-label="Select operator"
        >
          {availableOperators.map(op => (
            <option key={op} value={op}>
              {OPERATOR_ICONS[op]} {OPERATOR_LABELS[op]}
            </option>
          ))}
        </select>
      </div>

      {/* Value Input */}
      {needsValue && (
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
          <ValueInput
            field={selectedField}
            value={condition.value}
            onChange={handleValueChange}
          />
        </div>
      )}

      {/* Second Value for 'between' */}
      {needsTwoValues && (
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-700 mb-1">And</label>
          <ValueInput
            field={selectedField}
            value={condition.value2}
            onChange={handleValue2Change}
          />
        </div>
      )}

      {/* Remove Button */}
      <div className="flex-shrink-0 pt-6">
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Remove filter"
          title="Remove filter"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface ValueInputProps {
  field?: FilterField;
  value: any;
  onChange: (value: any) => void;
}

function ValueInput({ field, value, onChange }: ValueInputProps) {
  if (!field) {
    return (
      <input
        type="text"
        disabled
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
        placeholder="Select a field first"
      />
    );
  }

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter text..."
          aria-label={`Value for ${field.label}`}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter number..."
          aria-label={`Value for ${field.label}`}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          value={value ? (typeof value === 'string' ? value.split('T')[0] : value.toISOString().split('T')[0]) : ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label={`Value for ${field.label}`}
        />
      );

    case 'boolean':
      return (
        <select
          value={value === true ? 'true' : value === false ? 'false' : ''}
          onChange={(e) => onChange(e.target.value === 'true')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          aria-label={`Value for ${field.label}`}
        >
          <option value="">Select...</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );

    case 'select':
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          aria-label={`Value for ${field.label}`}
        >
          <option value="">Select...</option>
          {field.options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'multi-select':
      return (
        <select
          multiple
          value={Array.isArray(value) ? value : []}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
            onChange(selected);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          size={Math.min(field.options?.length || 1, 5)}
          aria-label={`Value for ${field.label}`}
        >
          {field.options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter value..."
          aria-label={`Value for ${field.label}`}
        />
      );
  }
}

function getDefaultValue(field: FilterField): any {
  switch (field.type) {
    case 'text':
      return '';
    case 'number':
      return 0;
    case 'date':
      return new Date().toISOString().split('T')[0];
    case 'boolean':
      return true;
    case 'select':
    case 'multi-select':
      return field.options?.[0]?.value || '';
    default:
      return '';
  }
}
