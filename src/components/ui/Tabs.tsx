import React, { useState, useRef, useEffect } from 'react';

/**
 * Tabs Component - Organize content into switchable sections
 * 
 * Features:
 * - Beautiful animations with sliding indicator
 * - Keyboard navigation (arrow keys + Enter)
 * - Responsive design
 * - Dark mode support
 * - Badge support for counts
 * - Icon support
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

  // Variant styles
  const getTabButtonClasses = (tab: Tab) => {
    const isActive = activeTab === tab.id;
    const baseClasses = `
      relative flex items-center gap-2 font-medium transition-all duration-200
      ${sizeClasses[size]}
      ${fullWidth ? 'flex-1 justify-center' : ''}
      ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `;

    if (variant === 'pills') {
      return `${baseClasses} rounded-lg
        ${isActive 
          ? 'bg-cyan-500 text-white shadow-md' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
        }
      `;
    } else if (variant === 'underline') {
      return `${baseClasses} border-b-2
        ${isActive 
          ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' 
          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }
      `;
    } else {
      // Default variant
      return `${baseClasses}
        ${isActive 
          ? 'text-cyan-600 dark:text-cyan-400' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }
      `;
    }
  };

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div 
        ref={tabsRef}
        className={`
          relative flex border-b border-slate-200 dark:border-slate-700
          ${fullWidth ? 'w-full' : 'inline-flex'}
          ${variant === 'pills' ? 'border-none gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg' : 'gap-1'}
        `}
        role="tablist"
      >
        {/* Sliding indicator (for default variant) */}
        {variant === 'default' && (
          <div
            className="absolute bottom-0 h-0.5 bg-cyan-500 transition-all duration-300 ease-out"
            style={indicatorStyle}
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
          >
            {tab.icon && (
              <span className="flex-shrink-0">
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`
                flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold
                ${activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                }
              `}>
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
            className={`
              ${activeTab === tab.id ? 'animate-fade-in' : ''}
            `}
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
