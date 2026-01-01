import React from 'react';

/**
 * CMF Nothing Design System - StatusBadge Component
 * ==================================================
 * Legacy status badge using CMF design tokens.
 * Consider using Badge from './Badge' for new components.
 */

type BadgeVariant = 'neutral' | 'success' | 'info' | 'warning' | 'danger';

const getVariantStyles = (variant: BadgeVariant): React.CSSProperties => {
  switch (variant) {
    case 'neutral':
      return {
        backgroundColor: 'var(--cmf-surface-2)',
        color: 'var(--cmf-text-secondary)',
      };
    case 'success':
      return {
        backgroundColor: 'var(--cmf-success-muted)',
        color: 'var(--cmf-success-text)',
      };
    case 'info':
      return {
        backgroundColor: 'var(--cmf-info-muted)',
        color: 'var(--cmf-info-text)',
      };
    case 'warning':
      return {
        backgroundColor: 'var(--cmf-warning-muted)',
        color: 'var(--cmf-warning-text)',
      };
    case 'danger':
      return {
        backgroundColor: 'var(--cmf-error-muted)',
        color: 'var(--cmf-error-text)',
      };
    default:
      return {};
  }
};

export const StatusBadge: React.FC<{ label: string; variant: BadgeVariant }> = ({ label, variant }) => (
  <span
    className="px-2 py-1 text-xs font-semibold rounded-full"
    style={getVariantStyles(variant)}
  >
    {label}
  </span>
);
