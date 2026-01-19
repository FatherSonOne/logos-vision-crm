import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// ============================================
// TYPES
// ============================================

export type FieldDataType = 'text' | 'number' | 'date' | 'boolean';

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';

export interface FieldMetadata {
  id: string;
  name: string;
  label: string;
  dataType: FieldDataType;
  isNumeric: boolean;
  isDate: boolean;
  isCategorical: boolean;
  aggregation?: AggregationType;
  format?: string;
}

// ============================================
// ICONS
// ============================================

const TextIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const NumberIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
);

const DateIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const BooleanIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DragHandleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
  </svg>
);

// ============================================
// COMPONENT
// ============================================

interface DraggableFieldProps {
  field: FieldMetadata;
  disabled?: boolean;
  compact?: boolean;
}

export const DraggableField: React.FC<DraggableFieldProps> = ({ field, disabled = false, compact = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: field.id,
    data: field,
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const getFieldIcon = () => {
    switch (field.dataType) {
      case 'text':
        return <TextIcon />;
      case 'number':
        return <NumberIcon />;
      case 'date':
        return <DateIcon />;
      case 'boolean':
        return <BooleanIcon />;
      default:
        return <TextIcon />;
    }
  };

  const getFieldTypeColor = () => {
    switch (field.dataType) {
      case 'text':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'number':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'date':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'boolean':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-medium transition-all cursor-move ${getFieldTypeColor()} ${
          isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        {...listeners}
        {...attributes}
      >
        <span className="opacity-60">{getFieldIcon()}</span>
        <span>{field.label}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-all cursor-move ${
        isDragging ? 'opacity-50 scale-95 shadow-lg' : 'hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...listeners}
      {...attributes}
      title={`${field.label} (${field.dataType})`}
    >
      <div className="opacity-40 group-hover:opacity-70 transition-opacity">
        <DragHandleIcon />
      </div>

      <div className={`p-2 rounded-lg ${getFieldTypeColor()}`}>
        {getFieldIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 dark:text-white truncate">
          {field.label}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {field.name}
        </div>
      </div>

      <div className={`px-2 py-0.5 rounded text-xs font-medium ${getFieldTypeColor()}`}>
        {field.dataType}
      </div>
    </div>
  );
};

export default DraggableField;
