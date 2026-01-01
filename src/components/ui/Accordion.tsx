import React, { useState, useRef, useEffect } from 'react';
import { ChevronRightIcon } from '../icons';

/**
 * CMF Nothing Design System - Accordion Component
 * ================================================
 * Expandable/Collapsible sections using CMF design tokens.
 * Clean, minimal aesthetic without gradients.
 */

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
  defaultExpanded?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  mode?: 'single' | 'multiple';
  variant?: 'default' | 'bordered' | 'separated';
  size?: 'sm' | 'md' | 'lg';
  allowToggle?: boolean;
  defaultExpandedItems?: string[];
  expandedItems?: string[];
  onExpandedChange?: (expandedIds: string[]) => void;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  mode = 'multiple',
  variant = 'default',
  size = 'md',
  allowToggle = true,
  defaultExpandedItems = [],
  expandedItems: controlledExpandedItems,
  onExpandedChange,
  className = ''
}) => {
  // Handle both controlled and uncontrolled modes
  const [internalExpandedItems, setInternalExpandedItems] = useState<string[]>(() => {
    const defaultExpanded = items
      .filter(item => item.defaultExpanded)
      .map(item => item.id);
    return defaultExpandedItems.length > 0 ? defaultExpandedItems : defaultExpanded;
  });

  const expandedItems = controlledExpandedItems !== undefined
    ? controlledExpandedItems
    : internalExpandedItems;

  const setExpandedItems = (ids: string[]) => {
    if (controlledExpandedItems === undefined) {
      setInternalExpandedItems(ids);
    }
    onExpandedChange?.(ids);
  };

  const toggleItem = (itemId: string) => {
    const isExpanded = expandedItems.includes(itemId);

    if (mode === 'single') {
      // In single mode, only one item can be expanded
      if (isExpanded && allowToggle) {
        setExpandedItems([]);
      } else {
        setExpandedItems([itemId]);
      }
    } else {
      // In multiple mode, any number of items can be expanded
      if (isExpanded) {
        setExpandedItems(expandedItems.filter(id => id !== itemId));
      } else {
        setExpandedItems([...expandedItems, itemId]);
      }
    }
  };

  const containerClasses = {
    default: 'space-y-2',
    bordered: 'rounded-lg divide-y',
    separated: 'space-y-4'
  };

  return (
    <div
      className={`${containerClasses[variant]} ${className}`}
      style={variant === 'bordered' ? {
        border: '1px solid var(--cmf-border)',
        borderRadius: 'var(--cmf-radius-lg)',
      } : undefined}
    >
      {items.map((item, index) => (
        <AccordionItemComponent
          key={item.id}
          item={item}
          isExpanded={expandedItems.includes(item.id)}
          onToggle={() => toggleItem(item.id)}
          variant={variant}
          size={size}
          index={index}
          totalItems={items.length}
        />
      ))}
    </div>
  );
};

// Individual Accordion Item Component
interface AccordionItemComponentProps {
  item: AccordionItem;
  isExpanded: boolean;
  onToggle: () => void;
  variant: 'default' | 'bordered' | 'separated';
  size: 'sm' | 'md' | 'lg';
  index: number;
  totalItems: number;
}

const AccordionItemComponent: React.FC<AccordionItemComponentProps> = ({
  item,
  isExpanded,
  onToggle,
  variant,
  size,
  index,
  totalItems
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  // Measure content height for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [item.content, isExpanded]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!item.disabled) {
        onToggle();
      }
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-4 py-3',
    md: 'text-base px-5 py-4',
    lg: 'text-lg px-6 py-5'
  };

  const contentPaddingClasses = {
    sm: 'px-4 py-3',
    md: 'px-5 py-4',
    lg: 'px-6 py-5'
  };

  const getHeaderStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      backgroundColor: 'var(--cmf-surface)',
      transition: 'all 150ms ease-out',
    };

    if (variant === 'default' || variant === 'separated') {
      return {
        ...base,
        borderRadius: 'var(--cmf-radius-lg)',
        boxShadow: 'var(--cmf-shadow-sm)',
      };
    }

    return base;
  };

  const getContentStyles = (): React.CSSProperties => {
    return {
      backgroundColor: 'var(--cmf-surface-2)',
      borderRadius: variant === 'bordered' ? '0' : '0 0 var(--cmf-radius-lg) var(--cmf-radius-lg)',
    };
  };

  return (
    <div
      className={`${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={variant === 'bordered' ? { borderColor: 'var(--cmf-divider)' } : undefined}
    >
      {/* Header/Trigger */}
      <button
        onClick={() => !item.disabled && onToggle()}
        onKeyDown={handleKeyDown}
        disabled={item.disabled}
        aria-expanded={isExpanded}
        aria-controls={`accordion-content-${item.id}`}
        className={`
          w-full flex items-center justify-between gap-3
          ${sizeClasses[size]}
          ${!item.disabled ? 'cursor-pointer' : 'cursor-not-allowed'}
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${variant === 'bordered' && index === 0 ? 'rounded-t-lg' : ''}
          ${variant === 'bordered' && index === totalItems - 1 && !isExpanded ? 'rounded-b-lg' : ''}
        `}
        style={{
          ...getHeaderStyles(),
          outlineColor: 'var(--cmf-accent)',
        }}
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          {/* Icon */}
          {item.icon && (
            <span style={{ color: 'var(--cmf-text-faint)' }}>
              {item.icon}
            </span>
          )}

          {/* Title */}
          <span
            className="font-semibold"
            style={{ color: isExpanded ? 'var(--cmf-accent)' : 'var(--cmf-text)' }}
          >
            {item.title}
          </span>

          {/* Badge */}
          {item.badge !== undefined && (
            <span
              className="flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: isExpanded ? 'var(--cmf-accent-muted)' : 'var(--cmf-surface-2)',
                color: isExpanded ? 'var(--cmf-accent)' : 'var(--cmf-text-muted)',
              }}
            >
              {item.badge}
            </span>
          )}
        </div>

        {/* Chevron */}
        <ChevronRightIcon
          className={`flex-shrink-0 transition-transform duration-300 ease-out ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
          style={{ color: isExpanded ? 'var(--cmf-accent)' : 'var(--cmf-text-faint)' }}
        />
      </button>

      {/* Content */}
      <div
        id={`accordion-content-${item.id}`}
        ref={contentRef}
        style={{
          height: isExpanded ? `${contentHeight}px` : '0px',
          ...getContentStyles(),
        }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        aria-hidden={!isExpanded}
      >
        <div className={contentPaddingClasses[size]}>
          {item.content}
        </div>
      </div>
    </div>
  );
};

/**
 * Simple Accordion - Easier API for basic use cases
 */
interface SimpleAccordionProps {
  children: React.ReactElement<AccordionSectionProps>[];
  mode?: 'single' | 'multiple';
  variant?: 'default' | 'bordered' | 'separated';
  size?: 'sm' | 'md' | 'lg';
  allowToggle?: boolean;
  className?: string;
}

export const SimpleAccordion: React.FC<SimpleAccordionProps> = ({
  children,
  mode = 'multiple',
  variant = 'default',
  size = 'md',
  allowToggle = true,
  className = ''
}) => {
  const items: AccordionItem[] = React.Children.map(children, (child, index) => ({
    id: `section-${index}`,
    title: child.props.title,
    content: child.props.children,
    icon: child.props.icon,
    badge: child.props.badge,
    disabled: child.props.disabled,
    defaultExpanded: child.props.defaultExpanded
  }));

  return (
    <Accordion
      items={items}
      mode={mode}
      variant={variant}
      size={size}
      allowToggle={allowToggle}
      className={className}
    />
  );
};

interface AccordionSectionProps {
  title: string;
  icon?: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export const AccordionSection: React.FC<AccordionSectionProps> = ({ children }) => {
  return <>{children}</>;
};
