import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  as?: 'div' | 'article' | 'section';
}

const variantClasses: Record<CardVariant, string> = {
  default:
    'bg-white border border-slate-200 shadow-sm ' +
    'dark:bg-slate-800 dark:border-slate-700',
  elevated:
    'bg-white border border-slate-100 shadow-md ' +
    'dark:bg-slate-800 dark:border-slate-700 dark:shadow-lg',
  outlined:
    'bg-transparent border border-slate-300 ' +
    'dark:border-slate-600',
  ghost:
    'bg-slate-50 border border-transparent ' +
    'dark:bg-slate-800/50',
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const hoverClasses =
  'cursor-pointer transition-all duration-200 ' +
  'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 ' +
  'dark:hover:border-slate-600 dark:hover:shadow-lg';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hoverable = false,
  as: Component = 'div',
}) => {
  const isClickable = !!onClick || hoverable;

  return (
    <Component
      onClick={onClick}
      className={`
        rounded-lg
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${isClickable ? hoverClasses : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </Component>
  );
};

Card.displayName = 'Card';

// Card sub-components for structured layouts
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  action,
}) => (
  <div
    className={`flex items-center justify-between mb-4 ${className}`.trim()}
  >
    <div className="flex-1">{children}</div>
    {action && <div className="flex-shrink-0 ml-4">{action}</div>}
  </div>
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  as: Component = 'h3',
}) => (
  <Component
    className={`text-lg font-semibold text-slate-900 dark:text-white ${className}`.trim()}
  >
    {children}
  </Component>
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = '',
}) => (
  <p className={`text-sm text-slate-600 dark:text-slate-400 mt-1 ${className}`.trim()}>
    {children}
  </p>
);

CardDescription.displayName = 'CardDescription';

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => <div className={className}>{children}</div>;

CardContent.displayName = 'CardContent';

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

const footerAlignClasses: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  align = 'right',
}) => (
  <div
    className={`
      flex items-center gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700
      ${footerAlignClasses[align]}
      ${className}
    `.trim().replace(/\s+/g, ' ')}
  >
    {children}
  </div>
);

CardFooter.displayName = 'CardFooter';

// Stat Card - commonly used in dashboards
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  gradient?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  gradient,
  onClick,
  className = '',
}) => {
  const baseClasses = gradient
    ? `bg-gradient-to-br ${gradient} text-white`
    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700';

  const textClasses = gradient
    ? {
        title: 'text-white/80',
        value: 'text-white',
        subtitle: 'text-white/70',
        icon: 'text-white/30',
      }
    : {
        title: 'text-slate-600 dark:text-slate-400',
        value: 'text-slate-900 dark:text-white',
        subtitle: 'text-slate-500 dark:text-slate-500',
        icon: 'text-slate-300 dark:text-slate-600',
      };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-lg shadow-md p-6
        ${onClick ? 'cursor-pointer transform hover:scale-105 transition-transform' : ''}
        ${baseClasses}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${textClasses.title}`}>{title}</p>
          <p className={`text-3xl font-bold mt-1 ${textClasses.value}`}>{value}</p>
          {subtitle && (
            <p className={`text-xs mt-1 ${textClasses.subtitle}`}>{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.value >= 0
                    ? 'text-green-500 dark:text-green-400'
                    : 'text-red-500 dark:text-red-400'
                }`}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%
              </span>
              {trend.label && (
                <span className={`text-xs ${textClasses.subtitle}`}>{trend.label}</span>
              )}
            </div>
          )}
        </div>
        {icon && <div className={textClasses.icon}>{icon}</div>}
      </div>
    </div>
  );
};

StatCard.displayName = 'StatCard';
