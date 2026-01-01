import React from 'react';

/**
 * CMF Nothing Design System - EmptyState Component
 * =================================================
 * Empty state placeholder using CMF design tokens.
 * No glassmorphism, clean matte aesthetic.
 */

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="text-center py-16 rounded-lg border border-dashed"
      style={{
        backgroundColor: 'var(--cmf-surface)',
        borderColor: 'var(--cmf-border-strong)',
      }}
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          backgroundColor: 'var(--cmf-accent-muted)',
          color: 'var(--cmf-accent)',
        }}
      >
        {icon}
      </div>
      <h3
        className="mt-4 text-lg font-semibold"
        style={{ color: 'var(--cmf-text)' }}
      >
        {title}
      </h3>
      <p
        className="mt-2 text-sm max-w-sm mx-auto"
        style={{ color: 'var(--cmf-text-muted)' }}
      >
        {description}
      </p>
      {action && (
        <div className="mt-6">
          <button
            type="button"
            onClick={action.onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-150"
            style={{
              backgroundColor: isHovered ? 'var(--cmf-accent-hover)' : 'var(--cmf-accent)',
              color: 'var(--cmf-accent-text)',
              boxShadow: 'var(--cmf-shadow-sm)',
            }}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
};
