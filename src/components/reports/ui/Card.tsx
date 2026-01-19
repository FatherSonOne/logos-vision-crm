import React, { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated';
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      interactive = false,
      padding = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-xl transition-all duration-200';

    const variantStyles = {
      default:
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
      outline:
        'bg-transparent border-2 border-gray-200 dark:border-gray-700',
      elevated:
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const interactiveStyles = interactive
      ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
      : '';

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${interactiveStyles} ${className}`;

    return (
      <div
        ref={ref}
        className={combinedClassName}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card subcomponents
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  divided?: boolean;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, divided = false, className = '', ...props }, ref) => {
    const dividerStyles = divided ? 'pb-4 mb-4 border-b border-gray-200 dark:border-gray-700' : '';
    return (
      <div
        ref={ref}
        className={`flex items-center justify-between ${dividerStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: 'sm' | 'md' | 'lg';
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, size = 'md', className = '', ...props }, ref) => {
    const sizeStyles = {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
    };

    return (
      <h3
        ref={ref}
        className={`font-semibold text-gray-900 dark:text-white ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = 'CardTitle';

const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`text-gray-700 dark:text-gray-300 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  divided?: boolean;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, divided = false, className = '', ...props }, ref) => {
    const dividerStyles = divided ? 'pt-4 mt-4 border-t border-gray-200 dark:border-gray-700' : '';
    return (
      <div
        ref={ref}
        className={`flex items-center gap-3 ${dividerStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardBody, CardFooter };
