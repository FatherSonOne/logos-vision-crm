import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FieldMetadata } from './DraggableField';

// ============================================
// ICONS
// ============================================

const RemoveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

// ============================================
// TYPES
// ============================================

export interface DropZoneProps {
  id: string;
  label: string;
  description?: string;
  acceptedTypes?: string[];
  maxItems?: number;
  fields: FieldMetadata[];
  onRemove: (fieldId: string) => void;
  required?: boolean;
  icon?: React.ReactNode;
  validate?: (field: FieldMetadata) => { valid: boolean; error?: string };
}

// ============================================
// COMPONENT
// ============================================

export const DropZone: React.FC<DropZoneProps> = ({
  id,
  label,
  description,
  acceptedTypes,
  maxItems,
  fields,
  onRemove,
  required = false,
  icon,
  validate,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      acceptedTypes,
      maxItems,
      currentCount: fields.length,
    },
  });

  const isEmpty = fields.length === 0;
  const isFull = maxItems !== undefined && fields.length >= maxItems;

  const getFieldColor = (dataType: string) => {
    switch (dataType) {
      case 'text':
        return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400';
      case 'number':
        return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400';
      case 'date':
        return 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-400';
      case 'boolean':
        return 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              {icon}
            </div>
          )}
          <div>
            <label className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {label}
              {required && <span className="text-red-500 text-xl">*</span>}
            </label>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        {maxItems && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
            fields.length >= maxItems
              ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
              : fields.length > 0
              ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {fields.length} / {maxItems}
          </div>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[160px] p-8 rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isOver && !isFull
            ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 shadow-2xl shadow-indigo-500/30 scale-[1.03] ring-4 ring-indigo-200 dark:ring-indigo-800'
            : isEmpty
            ? 'border-gray-300 dark:border-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-purple-50/50 dark:hover:from-indigo-900/10 dark:hover:to-purple-900/10 hover:shadow-lg'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 shadow-sm'
        }`}
      >
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all shadow-lg ${
              isOver && !isFull
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white scale-125 animate-pulse'
                : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-400 dark:text-gray-500'
            }`}>
              <PlusIcon />
            </div>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
              {isOver && !isFull ? 'Drop field here' : 'Drag and drop field here'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {isOver && !isFull ? 'Release to add field' : 'Drag from Available Fields above'}
            </p>
            {acceptedTypes && acceptedTypes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 justify-center">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Accepts:</span>
                {acceptedTypes.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-700"
                  >
                    {type}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field) => {
              const validation = validate ? validate(field) : { valid: true };
              return (
                <div
                  key={field.id}
                  className={`flex items-center justify-between gap-4 p-5 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-102 ${
                    validation.valid
                      ? getFieldColor(field.dataType)
                      : 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-400'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-3 h-3 rounded-full bg-current shadow-sm" />
                    <span className="text-base font-bold truncate">
                      {field.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {field.aggregation && field.aggregation !== 'none' && (
                      <span className="text-xs px-3 py-1.5 rounded-lg bg-white/70 dark:bg-black/40 uppercase font-extrabold tracking-wider shadow-sm border border-current/20">
                        {field.aggregation}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemove(field.id)}
                      className="p-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all hover:scale-110 group"
                      title="Remove field"
                      aria-label={`Remove ${field.label}`}
                    >
                      <RemoveIcon />
                    </button>
                  </div>
                </div>
              );
            })}
            {!isFull && (
              <div className={`text-sm text-center py-6 border-2 border-dashed rounded-xl transition-all ${
                isOver
                  ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-400 shadow-lg scale-105'
                  : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'
              }`}>
                <div className="flex items-center justify-center gap-3">
                  <svg className={`w-5 h-5 ${isOver ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-bold">{isOver ? 'Drop here to add more fields' : 'Drop additional fields here'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {isFull && isEmpty && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 mt-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Maximum capacity reached ({maxItems} field{maxItems !== 1 ? 's' : ''})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropZone;
