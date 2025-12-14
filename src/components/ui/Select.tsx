import React from 'react';

export type SelectSize = 'sm' | 'md' | 'lg';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: SelectSize;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

const sizeClasses: Record<SelectSize, string> = {
  sm: 'h-8 text-xs px-3 pr-8',
  md: 'h-10 text-sm px-3 pr-10',
  lg: 'h-12 text-base px-4 pr-12',
};

const labelSizeClasses: Record<SelectSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const chevronSizeClasses: Record<SelectSize, string> = {
  sm: 'right-2 w-4 h-4',
  md: 'right-3 w-4 h-4',
  lg: 'right-4 w-5 h-5',
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      options,
      placeholder,
      fullWidth = false,
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const baseClasses = `
      w-full rounded-lg border bg-white appearance-none
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50
      dark:bg-slate-800
    `;

    const stateClasses = hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600'
      : 'border-slate-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-slate-600 dark:focus:border-rose-400';

    const textColorClasses = 'text-slate-900 dark:text-slate-100';

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={selectId}
            className={`block font-medium text-slate-700 dark:text-slate-300 mb-1.5 ${labelSizeClasses[size]}`}
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`
              ${baseClasses}
              ${stateClasses}
              ${textColorClasses}
              ${sizeClasses[size]}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500 ${chevronSizeClasses[size]}`}
          >
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {(error || helperText) && (
          <p
            id={error ? `${selectId}-error` : `${selectId}-helper`}
            className={`mt-1.5 text-xs ${
              error
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Checkbox Component
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, error, disabled, className = '', id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            className={`
              h-4 w-4 rounded border-slate-300
              text-rose-500 focus:ring-rose-500 focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-rose-400
              ${hasError ? 'border-red-500' : ''}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined
            }
            {...props}
          />
        </div>
        {(label || helperText || error) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {label}
              </label>
            )}
            {(error || helperText) && (
              <p
                id={error ? `${checkboxId}-error` : `${checkboxId}-helper`}
                className={`text-xs mt-0.5 ${
                  error
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {error || helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Radio Group Component
interface RadioOption {
  value: string;
  label: string;
  helperText?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  error,
  orientation = 'vertical',
  className = '',
}) => {
  const hasError = !!error;

  return (
    <fieldset className={className}>
      {label && (
        <legend className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          {label}
        </legend>
      )}
      <div
        className={`flex ${
          orientation === 'vertical' ? 'flex-col gap-3' : 'flex-row flex-wrap gap-4'
        }`}
      >
        {options.map((option) => {
          const radioId = `${name}-${option.value}`;
          return (
            <div key={option.value} className="flex items-start gap-3">
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  id={radioId}
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={option.disabled}
                  className={`
                    h-4 w-4 border-slate-300
                    text-rose-500 focus:ring-rose-500 focus:ring-2 focus:ring-offset-0
                    disabled:opacity-50 disabled:cursor-not-allowed
                    dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-rose-400
                    ${hasError ? 'border-red-500' : ''}
                  `.trim().replace(/\s+/g, ' ')}
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor={radioId}
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  {option.label}
                </label>
                {option.helperText && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {option.helperText}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}
    </fieldset>
  );
};

RadioGroup.displayName = 'RadioGroup';
