import React from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import type { FilterGroup as FilterGroupType, FilterCondition, FilterField, LogicOperator } from '../filterTypes';
import { FilterRow } from './FilterRow';

interface FilterGroupProps {
  group: FilterGroupType;
  availableFields: FilterField[];
  onChange: (group: FilterGroupType) => void;
  onRemove?: () => void;
  depth?: number;
  maxDepth?: number;
}

export function FilterGroup({
  group,
  availableFields,
  onChange,
  onRemove,
  depth = 0,
  maxDepth = 3,
}: FilterGroupProps) {
  const canNest = depth < maxDepth;

  const handleLogicChange = (logic: LogicOperator) => {
    onChange({ ...group, logic });
  };

  const handleAddCondition = () => {
    const newCondition: FilterCondition = {
      id: `condition-${Date.now()}-${Math.random()}`,
      fieldId: availableFields[0]?.id || '',
      operator: 'equals',
      value: '',
    };

    onChange({
      ...group,
      conditions: [...group.conditions, newCondition],
    });
  };

  const handleAddGroup = () => {
    if (!canNest) return;

    const newGroup: FilterGroupType = {
      id: `group-${Date.now()}-${Math.random()}`,
      logic: 'AND',
      conditions: [],
      groups: [],
    };

    onChange({
      ...group,
      groups: [...group.groups, newGroup],
    });
  };

  const handleConditionChange = (index: number, condition: FilterCondition) => {
    const newConditions = [...group.conditions];
    newConditions[index] = condition;
    onChange({ ...group, conditions: newConditions });
  };

  const handleConditionRemove = (index: number) => {
    onChange({
      ...group,
      conditions: group.conditions.filter((_, i) => i !== index),
    });
  };

  const handleNestedGroupChange = (index: number, nestedGroup: FilterGroupType) => {
    const newGroups = [...group.groups];
    newGroups[index] = nestedGroup;
    onChange({ ...group, groups: newGroups });
  };

  const handleNestedGroupRemove = (index: number) => {
    onChange({
      ...group,
      groups: group.groups.filter((_, i) => i !== index),
    });
  };

  const handleDuplicateGroup = () => {
    if (!onRemove) return; // Can't duplicate root group

    const duplicated: FilterGroupType = {
      ...group,
      id: `group-${Date.now()}-${Math.random()}`,
      conditions: group.conditions.map(c => ({
        ...c,
        id: `condition-${Date.now()}-${Math.random()}`,
      })),
      groups: group.groups.map(g => duplicateGroup(g)),
    };

    // This would need to be handled by parent
    console.log('Duplicate group:', duplicated);
  };

  const borderColor = depth === 0 ? 'border-blue-200' : depth === 1 ? 'border-purple-200' : 'border-green-200';
  const bgColor = depth === 0 ? 'bg-blue-50/30' : depth === 1 ? 'bg-purple-50/30' : 'bg-green-50/30';
  const indent = depth * 20;

  return (
    <div
      className={`relative border-2 ${borderColor} ${bgColor} rounded-lg p-4`}
      style={{ marginLeft: depth > 0 ? `${indent}px` : 0 }}
      role="group"
      aria-label={`Filter group with ${group.logic} logic`}
    >
      {/* Connecting line for nested groups */}
      {depth > 0 && (
        <div
          className="absolute left-0 top-1/2 w-4 border-t-2 border-gray-300"
          style={{ transform: 'translateX(-100%)' }}
          aria-hidden="true"
        />
      )}

      {/* Group Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Logic Toggle */}
          <div className="flex bg-white border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => handleLogicChange('AND')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                group.logic === 'AND'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              aria-pressed={group.logic === 'AND'}
            >
              AND
            </button>
            <button
              onClick={() => handleLogicChange('OR')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                group.logic === 'OR'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              aria-pressed={group.logic === 'OR'}
            >
              OR
            </button>
          </div>

          <span className="text-xs text-gray-500">
            {group.logic === 'AND' ? 'All conditions must match' : 'Any condition can match'}
          </span>
        </div>

        {/* Group Actions */}
        <div className="flex items-center gap-2">
          {depth > 0 && (
            <>
              <button
                onClick={handleDuplicateGroup}
                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-white rounded transition-colors"
                title="Duplicate group"
                aria-label="Duplicate group"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={onRemove}
                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-white rounded transition-colors"
                title="Remove group"
                aria-label="Remove group"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-2 mb-3">
        {group.conditions.map((condition, index) => (
          <div key={condition.id} className="relative">
            {index > 0 && (
              <div className="absolute -top-1 left-8 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-600 z-10">
                {group.logic}
              </div>
            )}
            <FilterRow
              condition={condition}
              availableFields={availableFields}
              onChange={(updated) => handleConditionChange(index, updated)}
              onRemove={() => handleConditionRemove(index)}
            />
          </div>
        ))}
      </div>

      {/* Nested Groups */}
      {group.groups.length > 0 && (
        <div className="space-y-3 mb-3">
          {group.groups.map((nestedGroup, index) => (
            <div key={nestedGroup.id} className="relative">
              {(group.conditions.length > 0 || index > 0) && (
                <div className="absolute -top-2 left-8 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-600 z-10">
                  {group.logic}
                </div>
              )}
              <FilterGroup
                group={nestedGroup}
                availableFields={availableFields}
                onChange={(updated) => handleNestedGroupChange(index, updated)}
                onRemove={() => handleNestedGroupRemove(index)}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            </div>
          ))}
        </div>
      )}

      {/* Add Buttons */}
      <div className="flex gap-2 pt-2 border-t border-gray-200">
        <button
          onClick={handleAddCondition}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-700 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Filter
        </button>

        {canNest && (
          <button
            onClick={handleAddGroup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-700 hover:text-purple-800 hover:bg-purple-100 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Group
          </button>
        )}
      </div>

      {/* Empty State */}
      {group.conditions.length === 0 && group.groups.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">No filters yet</p>
          <p className="text-xs mt-1">Click "Add Filter" to get started</p>
        </div>
      )}
    </div>
  );
}

// Helper to recursively duplicate a group with new IDs
function duplicateGroup(group: FilterGroupType): FilterGroupType {
  return {
    ...group,
    id: `group-${Date.now()}-${Math.random()}`,
    conditions: group.conditions.map(c => ({
      ...c,
      id: `condition-${Date.now()}-${Math.random()}`,
    })),
    groups: group.groups.map(g => duplicateGroup(g)),
  };
}
