import React from 'react';

/**
 * CMF Nothing Design System - Select Component
 * =============================================
 * Form select and checkbox components using CMF design tokens.
 */

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
  sm: 'h-8 text-[13px] px-3 pr-8',
  md: 'h-10 text-sm px-3 pr-10',
  lg: 'h-12 text-[15px] px-4 pr-12',
};

const labelSizeClasses: Record<SelectSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-[15px]',
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
      options = [],
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

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={selectId}
            className={`block font-medium mb-1.5 ${labelSizeClasses[size]}`}
            style={{ color: 'var(--cmf-text-secondary)' }}
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
              w-full appearance-none
              rounded-[var(--cmf-radius-md)]
              transition-all duration-150 ease-out
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${sizeClasses[size]}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            style={{
              backgroundColor: 'var(--cmf-surface)',
              color: 'var(--cmf-text)',
              border: `1px solid ${hasError ? 'var(--cmf-error)' : 'var(--cmf-border-strong)'}`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = hasError ? 'var(--cmf-error)' : 'var(--cmf-accent)';
              e.currentTarget.style.boxShadow = hasError
                ? '0 0 0 3px var(--cmf-error-muted)'
                : '0 0 0 3px var(--cmf-accent-muted)';
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = hasError ? 'var(--cmf-error)' : 'var(--cmf-border-strong)';
              e.currentTarget.style.boxShadow = 'none';
              props.onBlur?.(e);
            }}
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
            {options && options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${chevronSizeClasses[size]}`}
            style={{ color: 'var(--cmf-text-faint)' }}
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
            className="mt-1.5 text-xs"
            style={{ color: error ? 'var(--cmf-error-text)' : 'var(--cmf-text-muted)' }}
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
    const [isChecked, setIsChecked] = React.useState(props.checked || props.defaultChecked || false);

    React.useEffect(() => {
      if (props.checked !== undefined) {
        setIsChecked(props.checked);
      }
    }, [props.checked]);

    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5">
          <div
            className={`
              relative w-4 h-4 rounded
              transition-all duration-150 ease-out
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            style={{
              backgroundColor: isChecked ? 'var(--cmf-accent)' : 'var(--cmf-surface)',
              border: `1px solid ${hasError ? 'var(--cmf-error)' : isChecked ? 'var(--cmf-accent)' : 'var(--cmf-border-strong)'}`,
            }}
          >
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              disabled={disabled}
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                if (props.checked === undefined) {
                  setIsChecked(e.target.checked);
                }
                props.onChange?.(e);
              }}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined
              }
              {...props}
            />
            {isChecked && (
              <svg
                className="absolute inset-0 w-4 h-4 p-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="var(--cmf-accent-text)"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        {(label || helperText || error) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium cursor-pointer"
                style={{ color: 'var(--cmf-text)' }}
              >
                {label}
              </label>
            )}
            {(error || helperText) && (
              <p
                id={error ? `${checkboxId}-error` : `${checkboxId}-helper`}
                className="text-xs mt-0.5"
                style={{ color: error ? 'var(--cmf-error-text)' : 'var(--cmf-text-muted)' }}
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
        <legend
          className="text-sm font-medium mb-3"
          style={{ color: 'var(--cmf-text-secondary)' }}
        >
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
          const isSelected = value === option.value;
          return (
            <div key={option.value} className="flex items-start gap-3">
              <div className="flex items-center h-5">
                <div
                  className={`
                    relative w-4 h-4 rounded-full
                    transition-all duration-150 ease-out
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `.trim().replace(/\s+/g, ' ')}
                  style={{
                    backgroundColor: 'var(--cmf-surface)',
                    border: `1px solid ${hasError ? 'var(--cmf-error)' : isSelected ? 'var(--cmf-accent)' : 'var(--cmf-border-strong)'}`,
                  }}
                >
                  <input
                    type="radio"
                    id={radioId}
                    name={name}
                    value={option.value}
                    checked={isSelected}
                    onChange={(e) => onChange?.(e.target.value)}
                    disabled={option.disabled}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {isSelected && (
                    <div
                      className="absolute inset-1 rounded-full"
                      style={{ backgroundColor: 'var(--cmf-accent)' }}
                    />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <label
                  htmlFor={radioId}
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: 'var(--cmf-text)' }}
                >
                  {option.label}
                </label>
                {option.helperText && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--cmf-text-muted)' }}
                  >
                    {option.helperText}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p
          className="text-xs mt-2"
          style={{ color: 'var(--cmf-error-text)' }}
        >
          {error}
        </p>
      )}
    </fieldset>
  );
};

RadioGroup.displayName = 'RadioGroup';
