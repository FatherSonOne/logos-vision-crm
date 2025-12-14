import React from 'react';

export type BadgeVariant =
  | 'neutral'
  | 'primary'
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

const variantClasses: Record<BadgeVariant, string> = {
  neutral:
    'bg-slate-100 text-slate-700 border-slate-200 ' +
    'dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600',
  primary:
    'bg-rose-100 text-rose-700 border-rose-200 ' +
    'dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800',
  success:
    'bg-green-100 text-green-700 border-green-200 ' +
    'dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
  warning:
    'bg-amber-100 text-amber-700 border-amber-200 ' +
    'dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800',
  danger:
    'bg-red-100 text-red-700 border-red-200 ' +
    'dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
  info:
    'bg-blue-100 text-blue-700 border-blue-200 ' +
    'dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
};

const dotColorClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-500',
  primary: 'bg-rose-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs gap-1',
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
        inline-flex items-center font-semibold rounded-full border
        transition-colors duration-150
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {dot && (
        <span
          className={`rounded-full ${dotColorClasses[variant]} ${dotSizeClasses[size]}`}
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
            hover:bg-black/10 dark:hover:bg-white/10
            focus:outline-none focus:ring-1 focus:ring-current
            transition-colors duration-150
          `.trim().replace(/\s+/g, ' ')}
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
