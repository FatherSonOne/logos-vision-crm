import React from 'react';
import { useCMFTheme, CMFHighlight, CMF_HIGHLIGHTS } from '../../contexts/CMFThemeContext';
import { CheckIcon } from '../icons';

/**
 * CMF Highlight Picker
 * ====================
 * A component that allows users to select their preferred accent color
 * from the 5 CMF Nothing highlight options.
 *
 * Usage:
 * <HighlightPicker />
 *
 * Or with custom label:
 * <HighlightPicker label="Choose your accent color" />
 */

interface HighlightPickerProps {
  label?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

const checkSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const HighlightPicker: React.FC<HighlightPickerProps> = ({
  label = 'Accent Color',
  showLabels = false,
  size = 'md',
  className = '',
}) => {
  const { highlight, setHighlight, highlightOptions } = useCMFTheme();

  const handleSelect = (id: CMFHighlight) => {
    setHighlight(id);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[color:var(--cmf-text-secondary)] mb-3">
          {label}
        </label>
      )}

      <div className="flex items-center gap-3">
        {highlightOptions.map((option) => {
          const isSelected = highlight === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className={`
                ${sizeClasses[size]}
                rounded-full
                flex items-center justify-center
                transition-all duration-150
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                focus-visible:ring-[color:var(--cmf-accent)]
                ${isSelected ? 'ring-2 ring-offset-2 ring-[color:var(--cmf-text)] dark:ring-white scale-110' : 'hover:scale-105'}
              `}
              style={{ backgroundColor: option.hex }}
              aria-label={`Select ${option.name} accent color`}
              aria-pressed={isSelected}
              title={option.name}
            >
              {isSelected && (
                <CheckIcon
                  className={`${checkSizeClasses[size]} ${
                    option.textOnAccent === 'light' ? 'text-white' : 'text-black'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {showLabels && (
        <div className="flex items-center gap-3 mt-2">
          {highlightOptions.map((option) => (
            <span
              key={option.id}
              className={`
                text-xs font-medium text-center
                ${highlight === option.id ? 'text-[color:var(--cmf-text)]' : 'text-[color:var(--cmf-text-muted)]'}
              `}
              style={{ width: sizeClasses[size].split(' ')[0].replace('w-', '') + 'rem' }}
            >
              {option.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Inline Highlight Picker - Compact version for toolbars/headers
 */
export const InlineHighlightPicker: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { highlight, setHighlight, highlightOptions } = useCMFTheme();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {highlightOptions.map((option) => {
        const isSelected = highlight === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setHighlight(option.id)}
            className={`
              w-5 h-5 rounded-full
              transition-all duration-100
              focus:outline-none
              ${isSelected ? 'ring-1 ring-offset-1 ring-[color:var(--cmf-text)]' : 'opacity-60 hover:opacity-100'}
            `}
            style={{ backgroundColor: option.hex }}
            aria-label={`${option.name} accent`}
            aria-pressed={isSelected}
            title={option.name}
          />
        );
      })}
    </div>
  );
};

/**
 * Highlight Preview Swatch - Shows current highlight color
 */
export const HighlightSwatch: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}> = ({ size = 'md', className = '', onClick }) => {
  const { currentHighlightOption } = useCMFTheme();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        rounded-full
        transition-transform duration-100
        hover:scale-105
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:ring-[color:var(--cmf-accent)]
        ${className}
      `}
      style={{ backgroundColor: currentHighlightOption.hex }}
      aria-label={`Current accent color: ${currentHighlightOption.name}`}
      title={`Accent: ${currentHighlightOption.name}`}
    />
  );
};

export default HighlightPicker;
