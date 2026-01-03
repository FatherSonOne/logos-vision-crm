import React, { useState, useRef, useEffect } from 'react';
import { ChevronRightIcon } from './icons';

/**
 * Accordion Component - Expandable/Collapsible Sections
 * 
 * Features:
 * - Smooth expand/collapse animations
 * - Single or multiple expansion modes
 * - Keyboard navigation (Space, Enter, Arrow keys)
 * - Icons and badges support
 * - Dark mode support
 * - Accessible (ARIA attributes)
 * - Nested accordions support
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
    bordered: 'border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-200 dark:divide-slate-700',
    separated: 'space-y-4'
  };

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
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
  // Using requestAnimationFrame to batch DOM reads and avoid layout thrashing
  useEffect(() => {
    if (contentRef.current) {
      const frameId = requestAnimationFrame(() => {
        if (contentRef.current) {
          setContentHeight(contentRef.current.scrollHeight);
        }
      });
      return () => cancelAnimationFrame(frameId);
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

  // Variant-specific classes
  const headerClasses = {
    default: 'bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md',
    bordered: 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50',
    separated: 'bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md'
  };

  const contentClasses = {
    default: 'bg-slate-50 dark:bg-slate-900/50 rounded-b-lg mt-1',
    bordered: 'bg-slate-50 dark:bg-slate-900/50',
    separated: 'bg-slate-50 dark:bg-slate-900/50 rounded-b-lg mt-1'
  };

  return (
    <div
      className={`
        ${variant === 'default' || variant === 'separated' ? 'overflow-hidden' : ''}
        ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
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
          ${headerClasses[variant]}
          ${!item.disabled ? 'cursor-pointer' : 'cursor-not-allowed'}
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
          dark:focus:ring-offset-slate-900
          ${variant === 'bordered' && index === 0 ? 'rounded-t-lg' : ''}
          ${variant === 'bordered' && index === totalItems - 1 && !isExpanded ? 'rounded-b-lg' : ''}
        `}
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          {/* Icon */}
          {item.icon && (
            <span className="flex-shrink-0 text-slate-500 dark:text-slate-400">
              {item.icon}
            </span>
          )}

          {/* Title */}
          <span className={`font-semibold ${isExpanded ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {item.title}
          </span>

          {/* Badge */}
          {item.badge !== undefined && (
            <span className={`
              flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full text-xs font-semibold
              ${isExpanded
                ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300'
                : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
              }
            `}>
              {item.badge}
            </span>
          )}
        </div>

        {/* Chevron */}
        <ChevronRightIcon 
          className={`
            flex-shrink-0 transition-transform duration-300 ease-out
            ${isExpanded ? 'rotate-90' : 'rotate-0'}
            ${isExpanded ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}
          `}
        />
      </button>

      {/* Content */}
      <div
        id={`accordion-content-${item.id}`}
        ref={contentRef}
        style={{
          height: isExpanded ? `${contentHeight}px` : '0px'
        }}
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${contentClasses[variant]}
        `}
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
