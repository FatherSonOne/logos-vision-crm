import React from 'react';

/**
 * CMF Aurora Design System - Skeleton Component
 * =============================================
 * Loading skeleton placeholders with aurora shimmer effects.
 * Serene, flowing animations for a polished loading experience.
 */

type SkeletonVariant = 'default' | 'aurora' | 'pulse';

interface SkeletonProps {
  className?: string;
  variant?: SkeletonVariant;
}

/**
 * A base skeleton component with shimmer animation.
 * Supports three variants:
 * - default: Standard shimmer effect
 * - aurora: Aurora-colored shimmer with teal/cyan/pink
 * - pulse: Simple pulse animation
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'default' }) => {
  const variantClasses = {
    default: 'skeleton',
    aurora: 'skeleton-aurora',
    pulse: 'animate-pulse'
  };

  return (
    <div
      className={`rounded-md ${variantClasses[variant]} ${className}`}
      style={variant === 'pulse' ? { backgroundColor: 'var(--cmf-surface-2)' } : undefined}
    />
  );
};

/**
 * A skeleton loader specifically for stat cards.
 */
export const CardSkeleton: React.FC<{ variant?: SkeletonVariant }> = ({ variant = 'default' }) => (
  <div
    className="p-5 rounded-lg border card-lift"
    style={{
      backgroundColor: 'var(--cmf-surface)',
      borderColor: 'var(--cmf-border)',
      boxShadow: 'var(--cmf-shadow-sm)',
    }}
  >
    <div className="flex justify-between items-start">
      <Skeleton variant={variant} className="h-4 w-1/3" />
      <Skeleton variant={variant} className="h-6 w-6 rounded-full" />
    </div>
    <div className="mt-4">
      <Skeleton variant={variant} className="h-8 w-1/2 mb-2" />
      <Skeleton variant={variant} className="h-3 w-1/4" />
    </div>
  </div>
);

/**
 * A skeleton loader for lists of items.
 */
export const ListSkeleton: React.FC<{ items?: number; variant?: SkeletonVariant }> = ({ items = 3, variant = 'default' }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 animate-fadeIn"
        style={{ animationDelay: `${i * 50}ms` }}
      >
        <Skeleton variant={variant} className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant={variant} className="h-4 w-3/4" />
          <Skeleton variant={variant} className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * A skeleton loader for tables.
 */
export const TableSkeleton: React.FC<{ rows?: number; cols?: number; variant?: SkeletonVariant }> = ({ rows = 5, cols = 4, variant = 'default' }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex gap-4 pb-3" style={{ borderBottom: '1px solid var(--cmf-border)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant={variant} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="flex gap-4 py-2 animate-fadeIn"
        style={{ animationDelay: `${rowIndex * 30}ms` }}
      >
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant={variant} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

/**
 * A skeleton loader for dashboard content.
 */
export const DashboardSkeleton: React.FC<{ variant?: SkeletonVariant }> = ({ variant = 'aurora' }) => (
  <div className="space-y-6 page-enter">
    {/* Stats row */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} variant={variant} />
      ))}
    </div>

    {/* Main content area */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Large card */}
      <div
        className="lg:col-span-2 p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--cmf-surface)',
          borderColor: 'var(--cmf-border)',
        }}
      >
        <Skeleton variant={variant} className="h-6 w-1/3 mb-4" />
        <Skeleton variant={variant} className="h-48 w-full rounded-lg" />
      </div>

      {/* Side panel */}
      <div
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--cmf-surface)',
          borderColor: 'var(--cmf-border)',
        }}
      >
        <Skeleton variant={variant} className="h-6 w-1/2 mb-4" />
        <ListSkeleton items={4} variant={variant} />
      </div>
    </div>
  </div>
);

/**
 * A skeleton loader for profile/contact cards.
 */
export const ProfileSkeleton: React.FC<{ variant?: SkeletonVariant }> = ({ variant = 'default' }) => (
  <div
    className="p-6 rounded-xl border text-center"
    style={{
      backgroundColor: 'var(--cmf-surface)',
      borderColor: 'var(--cmf-border)',
    }}
  >
    <Skeleton variant={variant} className="h-20 w-20 rounded-full mx-auto mb-4" />
    <Skeleton variant={variant} className="h-5 w-1/2 mx-auto mb-2" />
    <Skeleton variant={variant} className="h-4 w-1/3 mx-auto mb-4" />
    <div className="flex justify-center gap-2">
      <Skeleton variant={variant} className="h-8 w-20 rounded-md" />
      <Skeleton variant={variant} className="h-8 w-20 rounded-md" />
    </div>
  </div>
);

/**
 * A skeleton loader for form inputs.
 */
export const FormSkeleton: React.FC<{ fields?: number; variant?: SkeletonVariant }> = ({ fields = 4, variant = 'default' }) => (
  <div className="space-y-6">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton variant={variant} className="h-4 w-24" />
        <Skeleton variant={variant} className="h-10 w-full rounded-md" />
      </div>
    ))}
    <div className="flex gap-3 pt-4">
      <Skeleton variant={variant} className="h-10 w-24 rounded-md" />
      <Skeleton variant={variant} className="h-10 w-20 rounded-md" />
    </div>
  </div>
);
