import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 ' +
    'dark:bg-rose-600 dark:hover:bg-rose-500 ' +
    'shadow-sm hover:shadow-md focus-visible:ring-rose-500',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 ' +
    'dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 ' +
    'shadow-sm hover:shadow-md focus-visible:ring-slate-500',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 ' +
    'dark:text-slate-300 dark:hover:bg-slate-700 dark:active:bg-slate-600 ' +
    'focus-visible:ring-slate-500',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 ' +
    'dark:bg-red-600 dark:hover:bg-red-500 ' +
    'shadow-sm hover:shadow-md focus-visible:ring-red-500',
  success:
    'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 ' +
    'dark:bg-green-600 dark:hover:bg-green-500 ' +
    'shadow-sm hover:shadow-md focus-visible:ring-green-500',
  outline:
    'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 ' +
    'dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-800 dark:active:bg-slate-700 ' +
    'focus-visible:ring-slate-500',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => (
  <svg
    className={`animate-spin ${iconSizeClasses[size]}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg
          transition-all duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          dark:focus-visible:ring-offset-slate-900
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size={size} />
        ) : leftIcon ? (
          <span className={iconSizeClasses[size]}>{leftIcon}</span>
        ) : null}

        {children && <span>{children}</span>}

        {rightIcon && !isLoading && (
          <span className={iconSizeClasses[size]}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export const IconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> & {
    icon: React.ReactNode;
    'aria-label': string;
  }
>(({ variant = 'ghost', size = 'md', icon, className = '', ...props }, ref) => {
  const iconOnlySizes: Record<ButtonSize, string> = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-all duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-slate-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${iconOnlySizes[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      <span className={iconSizeClasses[size]}>{icon}</span>
    </button>
  );
});

IconButton.displayName = 'IconButton';
