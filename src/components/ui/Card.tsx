import React from 'react';

/**
 * CMF Nothing Design System - Card Component
 * ==========================================
 * Container components using CMF design tokens.
 */

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

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

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
  const [isHovered, setIsHovered] = React.useState(false);

  // CMF-based variant styles
  const getVariantStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      borderRadius: 'var(--cmf-radius-lg)',
      transition: 'all 150ms ease-out',
    };

    switch (variant) {
      case 'default':
        return {
          ...base,
          backgroundColor: 'var(--cmf-surface)',
          border: '1px solid var(--cmf-border)',
          boxShadow: 'var(--cmf-shadow-sm)',
        };
      case 'elevated':
        return {
          ...base,
          backgroundColor: 'var(--cmf-surface)',
          border: '1px solid var(--cmf-border)',
          boxShadow: 'var(--cmf-shadow-md)',
        };
      case 'outlined':
        return {
          ...base,
          backgroundColor: 'transparent',
          border: '1px solid var(--cmf-border-strong)',
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: 'var(--cmf-surface-2)',
          border: '1px solid transparent',
        };
      default:
        return base;
    }
  };

  const getHoverStyles = (): React.CSSProperties => {
    if (!isClickable || !isHovered) return {};

    return {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--cmf-shadow-lg)',
      borderColor: 'var(--cmf-border-strong)',
    };
  };

  return (
    <Component
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...getVariantStyles(),
        ...getHoverStyles(),
        cursor: isClickable ? 'pointer' : undefined,
      }}
      className={`
        ${paddingClasses[padding]}
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
    className={`text-lg font-semibold ${className}`.trim()}
    style={{ color: 'var(--cmf-text)' }}
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
  <p
    className={`text-sm mt-1 ${className}`.trim()}
    style={{ color: 'var(--cmf-text-muted)' }}
  >
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
      flex items-center gap-3 mt-6 pt-4
      ${footerAlignClasses[align]}
      ${className}
    `.trim().replace(/\s+/g, ' ')}
    style={{ borderTop: '1px solid var(--cmf-divider)' }}
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
  accentColor?: string; // Optional: use specific accent color
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-6 ${className}`.trim()}
      style={{
        backgroundColor: 'var(--cmf-surface)',
        border: '1px solid var(--cmf-border)',
        borderRadius: 'var(--cmf-radius-lg)',
        boxShadow: isHovered && onClick ? 'var(--cmf-shadow-lg)' : 'var(--cmf-shadow-md)',
        transform: isHovered && onClick ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 150ms ease-out',
        cursor: onClick ? 'pointer' : undefined,
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--cmf-text-muted)' }}
          >
            {title}
          </p>
          <p
            className="text-3xl font-bold mt-1"
            style={{ color: accentColor || 'var(--cmf-text)' }}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--cmf-text-faint)' }}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className="text-xs font-medium"
                style={{
                  color: trend.value >= 0 ? 'var(--cmf-success)' : 'var(--cmf-error)',
                }}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%
              </span>
              {trend.label && (
                <span
                  className="text-xs"
                  style={{ color: 'var(--cmf-text-faint)' }}
                >
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div style={{ color: 'var(--cmf-text-faint)' }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

StatCard.displayName = 'StatCard';
