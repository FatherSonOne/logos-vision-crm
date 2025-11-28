import React, { useState } from 'react';
import type { Page } from '../../types';

// Inline icon components
const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  onHomeClick?: () => void;
  maxItems?: number; // Collapse breadcrumbs if more than this
}

/**
 * Enhanced Breadcrumbs Component
 *
 * Features:
 * - Home button
 * - Icons for breadcrumbs
 * - Collapsing for long paths
 * - Keyboard navigation
 * - Mobile responsive
 * - Navigation history
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  onHomeClick,
  maxItems = 4,
}) => {
  const [showAll, setShowAll] = useState(false);

  // Determine if we need to collapse
  const shouldCollapse = items.length > maxItems && !showAll;
  const visibleItems = shouldCollapse
    ? [items[0], ...items.slice(-2)] // Show first and last 2
    : items;

  const collapsedCount = shouldCollapse ? items.length - 3 : 0;

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number, isLast: boolean) => (
    <li key={`${item.label}-${index}`} className="flex items-center">
      {(index > 0 || showHome) && (
        <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-slate-400 dark:text-slate-600 mx-2" />
      )}

      <button
        onClick={item.onClick}
        disabled={!item.onClick}
        className={`
          flex items-center gap-1.5 text-sm font-medium transition-colors
          ${isLast || !item.onClick
            ? 'text-slate-500 dark:text-slate-400 cursor-default'
            : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:underline'
          }
        `}
        aria-current={isLast ? 'page' : undefined}
      >
        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
        <span className="truncate max-w-[200px]">{item.label}</span>
      </button>
    </li>
  );

  return (
    <nav className="flex items-center" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center flex-wrap gap-y-2 text-shadow-strong">
        {/* Home button */}
        {showHome && onHomeClick && (
          <li className="flex items-center">
            <button
              onClick={onHomeClick}
              className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              aria-label="Go to dashboard"
            >
              <HomeIcon className="h-5 w-5" />
            </button>
          </li>
        )}

        {/* Breadcrumb items */}
        {shouldCollapse ? (
          <>
            {renderBreadcrumbItem(visibleItems[0], 0, false)}

            {/* Collapsed indicator */}
            <li className="flex items-center">
              <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-slate-400 dark:text-slate-600 mx-2" />
              <button
                onClick={() => setShowAll(true)}
                className="px-2 py-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title={`Show ${collapsedCount} more items`}
              >
                <span className="font-medium">···</span>
                <span className="ml-1 text-xs">({collapsedCount})</span>
              </button>
            </li>

            {visibleItems.slice(1).map((item, idx) =>
              renderBreadcrumbItem(item, idx + 1, idx === visibleItems.length - 2)
            )}
          </>
        ) : (
          visibleItems.map((item, index) =>
            renderBreadcrumbItem(item, index, index === visibleItems.length - 1)
          )
        )}
      </ol>
    </nav>
  );
};

// Helper function to generate breadcrumbs for a given page
export const getBreadcrumbsForPage = (page: Page, detailContext?: any): BreadcrumbItem[] => {
  const pageLabels: Record<Page, string> = {
    'dashboard': 'Dashboard',
    'organizations': 'Organizations',
    'contacts': 'Contacts',
    'projects': 'Projects',
    'team': 'Team',
    'activities': 'Activities',
    'calendar': 'Calendar',
    'volunteers': 'Volunteers',
    'charity': 'Charity Tracker',
    'case': 'Case Management',
    'chat': 'Team Chat',
    'video': 'Video Conference',
    'tasks': 'Tasks',
    'email': 'Email Campaigns',
    'events': 'Events',
    'documents': 'Documents',
    'donations': 'Donations',
    'reports': 'Reports',
    'form-generator': 'Form Generator',
    'web-management': 'Web Management',
    'portal-builder': 'Portal Builder',
    'client-portal': 'Client Portal',
    'ai-tools': 'AI Tools',
    'grant-assistant': 'Grant Assistant',
    'live-chat': 'Live Chat',
    'search-results': 'Search Results'
  };

  const items: BreadcrumbItem[] = [
    { label: pageLabels[page] }
  ];

  // Add detail context if provided
  if (detailContext) {
    if (detailContext.projectName) {
      items.push({ label: detailContext.projectName });
    }
    if (detailContext.clientName) {
      items.push({ label: detailContext.clientName });
    }
    if (detailContext.caseTitle) {
      items.push({ label: detailContext.caseTitle });
    }
  }

  return items;
};
