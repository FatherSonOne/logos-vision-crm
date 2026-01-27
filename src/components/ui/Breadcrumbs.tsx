import React from 'react';
import type { Page } from '../../types';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const ChevronRightIcon: React.FC = () => (
  <svg
    className="h-4 w-4 flex-shrink-0"
    style={{ color: 'var(--cmf-text-faint)' }}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
  </svg>
);

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = !!item.onClick;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {index > 0 && <ChevronRightIcon />}
              <button
                onClick={item.onClick}
                disabled={!isClickable}
                className={`
                  ${index > 0 ? 'ml-1' : ''}
                  text-sm font-medium transition-colors truncate max-w-[200px]
                  ${isClickable && !isLast
                    ? 'hover:underline cursor-pointer'
                    : 'cursor-default'}
                `}
                style={{
                  color: isLast ? 'var(--cmf-text)' : 'var(--cmf-text-muted)'
                }}
                aria-current={isLast ? 'page' : undefined}
                title={item.label}
              >
                {item.label}
              </button>
            </li>
          );
        })}
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
    'clients': 'Clients',
    'households': 'Households',
    'projects': 'Projects',
    'project-hub': 'Project Hub',
    'team': 'Team',
    'activities': 'Activities',
    'calendar': 'Calendar',
    'calendar-settings': 'Calendar Settings',
    'volunteers': 'Volunteers',
    'charity': 'Charity Tracker',
    'case': 'Case Management',
    'cases': 'Cases',
    'chat': 'Team Chat',
    'video': 'Video Conference',
    'tasks': 'Tasks',
    'email': 'Email Campaigns',
    'events': 'Events',
    'documents': 'Documents',
    'donations': 'Donations',
    'pledges': 'Pledges',
    'reports': 'Reports',
    'form-generator': 'Form Generator',
    'web-management': 'Web Management',
    'portal-builder': 'Portal Builder',
    'client-portal': 'Client Portal',
    'ai-tools': 'AI Tools',
    'grant-assistant': 'Grant Assistant',
    'live-chat': 'Live Chat',
    'stewardship': 'Stewardship',
    'campaigns': 'Campaigns',
    'analytics': 'Analytics',
    'impact': 'Impact',
    'impact-reports': 'Impact Reports',
    'donor-pipeline': 'Donor Pipeline',
    'cultivation': 'Cultivation',
    'touchpoints': 'Touchpoints',
    'search-results': 'Search Results',
    'pulse-settings': 'Pulse Settings',
    'entomate-sync': 'Entomate Sync',
    'settings': 'Settings',
    'outreach-hub': 'Outreach Hub',
    'forge': 'Content Studio',
    'connect': 'Connect Hub',
    'design-preview': 'Logo Preview'
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
