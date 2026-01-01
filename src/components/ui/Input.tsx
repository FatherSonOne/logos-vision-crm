import React from 'react';

/**
 * CMF Nothing Design System - Input Component
 * ============================================
 * Form input components using CMF design tokens.
 */

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
  sm: 'h-8 text-[13px] px-3',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-[15px] px-4',
};

const labelSizeClasses: Record<InputSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-[15px]',
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

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block font-medium mb-1.5 ${labelSizeClasses[size]}`}
            style={{ color: 'var(--cmf-text-secondary)' }}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--cmf-text-faint)' }}
            >
              <span className={iconSizeClasses[size]}>{leftIcon}</span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              w-full
              rounded-[var(--cmf-radius-md)]
              transition-all duration-150 ease-out
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${sizeClasses[size]}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
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
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--cmf-text-faint)' }}
            >
              <span className={iconSizeClasses[size]}>{rightIcon}</span>
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            id={error ? `${inputId}-error` : `${inputId}-helper`}
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

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--cmf-text-secondary)' }}
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
            w-full px-3 py-2.5 text-sm
            rounded-[var(--cmf-radius-md)]
            transition-all duration-150 ease-out
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-y min-h-[80px]
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
            hasError ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />

        {(error || helperText) && (
          <p
            id={error ? `${textareaId}-error` : `${textareaId}-helper`}
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

Textarea.displayName = 'Textarea';
