import React from 'react';
import type { Page } from '../types';
import type { BreadcrumbItem } from './breadcrumbsHelper';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  currentPage: string;
  onNavigate: (page: Page) => void;
}

const ChevronIcon: React.FC = () => (
  <svg 
    className="w-4 h-4 text-slate-400 dark:text-slate-500 mx-2 flex-shrink-0" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const HomeIcon: React.FC = () => (
  <svg 
    className="w-4 h-4 flex-shrink-0" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, currentPage, onNavigate }) => {
  // Don't show breadcrumbs on dashboard (home page)
  if (currentPage === 'dashboard' || items.length === 0) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="mb-6 page-transition"
    >
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        {/* Home/Dashboard Link */}
        <li className="flex items-center">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-slate-600 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-all duration-200 focus-ring-primary group"
            aria-label="Go to Dashboard"
          >
            <HomeIcon />
            <span className="font-medium hidden sm:inline">Home</span>
          </button>
        </li>

        {/* Breadcrumb Items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center stagger-item" style={{ animationDelay: `${index * 50}ms` }}>
              <ChevronIcon />
              
              {isLast ? (
                // Current page (not clickable)
                <span 
                  className="px-2 py-1 font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                // Previous pages (clickable)
                <button
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (item.page) {
                      onNavigate(item.page);
                    }
                  }}
                  className="px-2 py-1 rounded-md text-slate-600 hover:text-primary-600 hover:bg-primary-50 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-all duration-200 font-medium focus-ring-primary truncate max-w-[150px] sm:max-w-none"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Helper function to generate breadcrumbs for common pages
export const getBreadcrumbsForPage = (
  page: Page,
  detailContext?: {
    clientName?: string;
    projectName?: string;
    activityTitle?: string;
    caseTitle?: string;
    teamMemberName?: string;
    donationDonor?: string;
  }
): BreadcrumbItem[] => {
  const breadcrumbs: BreadcrumbItem[] = [];

  switch (page) {
    case 'clients':
    case 'organizations':
      breadcrumbs.push({ label: 'Organizations', page: 'organizations' });
      break;

    case 'projects':
      breadcrumbs.push({ label: 'Projects', page: 'projects' });
      break;

    case 'tasks':
      breadcrumbs.push({ label: 'Tasks', page: 'tasks' });
      break;

    case 'activities':
      breadcrumbs.push({ label: 'Activities', page: 'activities' });
      break;

    case 'case':
    case 'cases':
      breadcrumbs.push({ label: 'Cases', page: 'cases' });
      break;
    
    case 'team':
      breadcrumbs.push({ label: 'Team', page: 'team' });
      break;
    
    case 'donations':
      breadcrumbs.push({ label: 'Donations', page: 'donations' });
      break;
    
    case 'documents':
      breadcrumbs.push({ label: 'Documents', page: 'documents' });
      break;
    
    case 'settings':
      breadcrumbs.push({ label: 'Settings', page: 'settings' });
      break;
  }

  // Add detail context if provided (these become the current page, not clickable)
  if (detailContext) {
    if (detailContext.clientName) {
      breadcrumbs.push({ label: detailContext.clientName });
    }
    if (detailContext.projectName) {
      breadcrumbs.push({ label: detailContext.projectName });
    }
    if (detailContext.activityTitle) {
      breadcrumbs.push({ label: detailContext.activityTitle });
    }
    if (detailContext.caseTitle) {
      breadcrumbs.push({ label: detailContext.caseTitle });
    }
    if (detailContext.teamMemberName) {
      breadcrumbs.push({ label: detailContext.teamMemberName });
    }
    if (detailContext.donationDonor) {
      breadcrumbs.push({ label: detailContext.donationDonor });
    }
  }

  return breadcrumbs;
};
