import React, { useState, useRef, useEffect } from 'react';

/**
 * CMF Nothing Design System - Tabs Component
 * ==========================================
 * Tab navigation using CMF design tokens.
 * Clean, minimal aesthetic without gradients.
 */

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = ''
}) => {
  // Handle both controlled and uncontrolled modes
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs[0]?.id || ''
  );

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update indicator position when active tab changes
  useEffect(() => {
    if (tabsRef.current && variant !== 'pills') {
      const activeButton = tabsRef.current.querySelector(
        `[data-tab-id="${activeTab}"]`
      ) as HTMLElement;

      if (activeButton) {
        setIndicatorStyle({
          left: activeButton.offsetLeft,
          width: activeButton.offsetWidth
        });
      }
    }
  }, [activeTab, variant, tabs]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    const currentIndex = tabs.findIndex(t => t.id === tabId);
    let nextIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
      // Skip disabled tabs
      while (tabs[nextIndex]?.disabled && nextIndex !== currentIndex) {
        nextIndex = (nextIndex + 1) % tabs.length;
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      // Skip disabled tabs
      while (tabs[nextIndex]?.disabled && nextIndex !== currentIndex) {
        nextIndex = (nextIndex - 1 + tabs.length) % tabs.length;
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
      while (tabs[nextIndex]?.disabled && nextIndex < tabs.length - 1) {
        nextIndex++;
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabs.length - 1;
      while (tabs[nextIndex]?.disabled && nextIndex > 0) {
        nextIndex--;
      }
    }

    if (nextIndex !== currentIndex && !tabs[nextIndex]?.disabled) {
      setActiveTab(tabs[nextIndex].id);
      // Focus the new tab
      const nextButton = tabsRef.current?.querySelector(
        `[data-tab-id="${tabs[nextIndex].id}"]`
      ) as HTMLElement;
      nextButton?.focus();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-2.5',
    lg: 'text-lg px-5 py-3'
  };

  // Variant styles using CMF tokens
  const getTabButtonStyles = (tab: Tab): React.CSSProperties => {
    const isActive = activeTab === tab.id;

    if (variant === 'pills') {
      return {
        backgroundColor: isActive ? 'var(--cmf-accent)' : 'transparent',
        color: isActive ? 'var(--cmf-accent-text)' : 'var(--cmf-text-muted)',
        borderRadius: 'var(--cmf-radius-md)',
      };
    } else if (variant === 'underline') {
      return {
        borderBottom: isActive ? '2px solid var(--cmf-accent)' : '2px solid transparent',
        color: isActive ? 'var(--cmf-accent)' : 'var(--cmf-text-muted)',
      };
    } else {
      return {
        color: isActive ? 'var(--cmf-accent)' : 'var(--cmf-text-muted)',
      };
    }
  };

  const getTabButtonClasses = (tab: Tab) => {
    const baseClasses = `
      relative flex items-center gap-2 font-medium transition-all duration-200
      ${sizeClasses[size]}
      ${fullWidth ? 'flex-1 justify-center' : ''}
      ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `;
    return baseClasses;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div
        ref={tabsRef}
        className={`relative flex ${fullWidth ? 'w-full' : 'inline-flex'} gap-1`}
        style={{
          borderBottom: variant === 'pills' ? 'none' : '1px solid var(--cmf-border)',
          backgroundColor: variant === 'pills' ? 'var(--cmf-surface-2)' : 'transparent',
          padding: variant === 'pills' ? '4px' : '0',
          borderRadius: variant === 'pills' ? 'var(--cmf-radius-lg)' : '0',
        }}
        role="tablist"
      >
        {/* Sliding indicator (for default variant) */}
        {variant === 'default' && (
          <div
            className="absolute bottom-0 h-0.5 transition-all duration-300 ease-out"
            style={{
              ...indicatorStyle,
              backgroundColor: 'var(--cmf-accent)',
            }}
          />
        )}

        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            className={getTabButtonClasses(tab)}
            style={getTabButtonStyles(tab)}
          >
            {tab.icon && (
              <span className="flex-shrink-0">
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: activeTab === tab.id
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'var(--cmf-surface-3)',
                  color: activeTab === tab.id
                    ? 'inherit'
                    : 'var(--cmf-text-muted)',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={tab.id}
            hidden={activeTab !== tab.id}
            className={`${activeTab === tab.id ? 'animate-fade-in' : ''}`}
          >
            {activeTab === tab.id && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Simple Tabs - A simpler API for basic use cases
 */
interface SimpleTabsProps {
  children: React.ReactElement<SimpleTabPanelProps>[];
  defaultTab?: number;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SimpleTabs: React.FC<SimpleTabsProps> = ({
  children,
  defaultTab = 0,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const [activeIndex, setActiveIndex] = useState(defaultTab);

  const tabs: Tab[] = React.Children.map(children, (child, index) => ({
    id: `tab-${index}`,
    label: child.props.label,
    icon: child.props.icon,
    badge: child.props.badge,
    content: child.props.children,
    disabled: child.props.disabled
  }));

  return (
    <Tabs
      tabs={tabs}
      activeTab={`tab-${activeIndex}`}
      onTabChange={(tabId) => {
        const index = parseInt(tabId.split('-')[1]);
        setActiveIndex(index);
      }}
      variant={variant}
      size={size}
      className={className}
    />
  );
};

interface SimpleTabPanelProps {
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
  children: React.ReactNode;
}

export const TabPanel: React.FC<SimpleTabPanelProps> = ({ children }) => {
  return <>{children}</>;
};
