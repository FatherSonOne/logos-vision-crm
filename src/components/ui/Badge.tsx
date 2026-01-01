import React from 'react';

/**
 * CMF Nothing Design System - Badge Component
 * ============================================
 * Status indicator badges using CMF design tokens.
 */

export type BadgeVariant =
  | 'neutral'
  | 'primary'   // Uses accent color
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

// CMF-based variant styles
const getVariantStyles = (variant: BadgeVariant): React.CSSProperties => {
  switch (variant) {
    case 'neutral':
      return {
        backgroundColor: 'var(--cmf-surface-2)',
        color: 'var(--cmf-text-secondary)',
        borderColor: 'var(--cmf-border)',
      };
    case 'primary':
      return {
        backgroundColor: 'var(--cmf-accent-muted)',
        color: 'var(--cmf-accent)',
        borderColor: 'var(--cmf-accent-subtle)',
      };
    case 'success':
      return {
        backgroundColor: 'var(--cmf-success-muted)',
        color: 'var(--cmf-success-text)',
        borderColor: 'transparent',
      };
    case 'warning':
      return {
        backgroundColor: 'var(--cmf-warning-muted)',
        color: 'var(--cmf-warning-text)',
        borderColor: 'transparent',
      };
    case 'danger':
      return {
        backgroundColor: 'var(--cmf-error-muted)',
        color: 'var(--cmf-error-text)',
        borderColor: 'transparent',
      };
    case 'info':
      return {
        backgroundColor: 'var(--cmf-info-muted)',
        color: 'var(--cmf-info-text)',
        borderColor: 'transparent',
      };
    default:
      return {};
  }
};

const getDotColor = (variant: BadgeVariant): string => {
  switch (variant) {
    case 'neutral':
      return 'var(--cmf-text-muted)';
    case 'primary':
      return 'var(--cmf-accent)';
    case 'success':
      return 'var(--cmf-success)';
    case 'warning':
      return 'var(--cmf-warning)';
    case 'danger':
      return 'var(--cmf-error)';
    case 'info':
      return 'var(--cmf-info)';
    default:
      return 'var(--cmf-text-muted)';
  }
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[11px] gap-1',
  md: 'px-2 py-1 text-xs gap-1.5',
  lg: 'px-2.5 py-1 text-sm gap-2',
};

const dotSizeClasses: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2 h-2',
};

const iconSizeClasses: Record<BadgeSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  icon,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center font-semibold
        rounded-full transition-colors duration-150
        ${sizeClasses[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{
        ...getVariantStyles(variant),
        border: '1px solid',
      }}
    >
      {dot && (
        <span
          className={`rounded-full ${dotSizeClasses[size]}`}
          style={{ backgroundColor: getDotColor(variant) }}
          aria-hidden="true"
        />
      )}

      {icon && <span className={iconSizeClasses[size]}>{icon}</span>}

      <span>{children}</span>

      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={`
            -mr-0.5 ml-0.5 rounded-full p-0.5
            transition-colors duration-150
            focus:outline-none focus:ring-1 focus:ring-current
          `.trim().replace(/\s+/g, ' ')}
          style={{
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--cmf-hover-overlay)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Remove"
        >
          <svg
            className={iconSizeClasses[size]}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

Badge.displayName = 'Badge';

// Preset status badges for common use cases
export type DonorStage = 'Prospect' | 'First-time Donor' | 'Repeat Donor' | 'Major Donor' | 'Lapsed';
export type EngagementLevel = 'high' | 'medium' | 'low';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';

const donorStageVariants: Record<DonorStage, BadgeVariant> = {
  'Prospect': 'neutral',
  'First-time Donor': 'info',
  'Repeat Donor': 'primary',
  'Major Donor': 'warning',
  'Lapsed': 'danger',
};

const engagementVariants: Record<EngagementLevel, BadgeVariant> = {
  high: 'success',
  medium: 'warning',
  low: 'neutral',
};

const projectStatusVariants: Record<ProjectStatus, BadgeVariant> = {
  planning: 'neutral',
  active: 'success',
  'on-hold': 'warning',
  completed: 'info',
  cancelled: 'danger',
};

export const DonorStageBadge: React.FC<{ stage: DonorStage; size?: BadgeSize }> = ({
  stage,
  size = 'md',
}) => (
  <Badge variant={donorStageVariants[stage]} size={size}>
    {stage}
  </Badge>
);

export const EngagementBadge: React.FC<{ level: EngagementLevel; size?: BadgeSize }> = ({
  level,
  size = 'md',
}) => (
  <Badge variant={engagementVariants[level]} size={size} dot>
    {level.charAt(0).toUpperCase() + level.slice(1)}
  </Badge>
);

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus; size?: BadgeSize }> = ({
  status,
  size = 'md',
}) => (
  <Badge variant={projectStatusVariants[status]} size={size}>
    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
  </Badge>
);
