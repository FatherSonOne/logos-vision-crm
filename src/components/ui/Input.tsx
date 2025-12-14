import React from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-8 text-xs px-3',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4',
};

const labelSizeClasses: Record<InputSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const iconSizeClasses: Record<InputSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const baseInputClasses = `
      w-full rounded-lg border bg-white
      transition-all duration-200 ease-in-out
      placeholder:text-slate-400
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50
      dark:bg-slate-800 dark:placeholder:text-slate-500
    `;

    const stateClasses = hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600'
      : 'border-slate-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-slate-600 dark:focus:border-rose-400';

    const textColorClasses = 'text-slate-900 dark:text-slate-100';

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block font-medium text-slate-700 dark:text-slate-300 mb-1.5 ${labelSizeClasses[size]}`}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
              <span className={iconSizeClasses[size]}>{leftIcon}</span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              ${baseInputClasses}
              ${stateClasses}
              ${textColorClasses}
              ${sizeClasses[size]}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <span className={iconSizeClasses[size]}>{rightIcon}</span>
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            id={error ? `${inputId}-error` : `${inputId}-helper`}
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

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      disabled,
      className = '',
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const baseClasses = `
      w-full rounded-lg border bg-white px-3 py-2.5 text-sm
      transition-all duration-200 ease-in-out
      placeholder:text-slate-400
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50
      dark:bg-slate-800 dark:placeholder:text-slate-500
      resize-y min-h-[80px]
    `;

    const stateClasses = hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600'
      : 'border-slate-300 focus:border-rose-500 focus:ring-rose-500/20 dark:border-slate-600 dark:focus:border-rose-400';

    const textColorClasses = 'text-slate-900 dark:text-slate-100';

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          className={`
            ${baseClasses}
            ${stateClasses}
            ${textColorClasses}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />

        {(error || helperText) && (
          <p
            id={error ? `${textareaId}-error` : `${textareaId}-helper`}
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

Textarea.displayName = 'Textarea';
