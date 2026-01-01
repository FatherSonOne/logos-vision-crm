import type { Page } from '../types';

export interface BreadcrumbItem {
  label: string;
  page?: Page;
  onClick?: () => void;
}

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
