// src/components/ui/PageTourSteps.ts
// Page-specific tour step configurations for the Guided Tour system
// Uses actual element IDs from the components

import type { TourStep } from '../GuidedTour';

// Dashboard tour steps - using actual IDs
export const dashboardTourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation Sidebar',
    content: 'Access all sections of your CRM from here. Click any item to navigate to that page.',
    position: 'right'
  },
  {
    selector: '#global-search',
    title: 'Global Search',
    content: 'Search across all contacts, projects, donations, and documents. Enable web search to find new leads online.',
    position: 'bottom'
  },
  {
    selector: '#dashboard-briefing',
    title: 'Daily Briefing',
    content: 'AI-generated summary of your day including tasks, meetings, and priorities.',
    position: 'bottom'
  },
  {
    selector: '#dashboard-stats',
    title: 'Quick Stats',
    content: 'View key metrics at a glance - organizations, contacts, pipeline value, and active projects.',
    position: 'bottom'
  },
  {
    selector: '#dashboard-kpis',
    title: 'Key Performance Indicators',
    content: 'Track donation trends, donor retention, and organizational impact metrics.',
    position: 'top'
  },
  {
    selector: '#guided-tour-button',
    title: 'Help & Tours',
    content: 'Click this button anytime to start a guided tour of the current page.',
    position: 'left'
  }
];

// Contacts tour steps
export const contactsTourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation',
    content: 'You are viewing the Contacts page. Use the sidebar to navigate to other sections.',
    position: 'right'
  },
  {
    selector: '#global-search',
    title: 'Search Contacts',
    content: 'Quickly find any contact by name, email, phone, or other attributes.',
    position: 'bottom'
  },
  {
    selector: '#contacts-header',
    title: 'Contacts Overview',
    content: 'Manage all your contacts from this page. Add new contacts, sort, and filter your list.',
    position: 'bottom'
  },
  {
    selector: '#contacts-find-nearby',
    title: 'Find Nearby',
    content: 'Discover potential partners and resources near your location using Google Maps.',
    position: 'bottom'
  },
  {
    selector: '#contacts-sort',
    title: 'Sort Options',
    content: 'Sort contacts alphabetically, by date added, or by location.',
    position: 'left'
  },
  {
    selector: '#contacts-grid',
    title: 'Contact Cards',
    content: 'Click any contact card to view their full profile with history and details.',
    position: 'top'
  }
];

// Projects tour steps
export const projectsTourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation',
    content: 'You are viewing Projects. Track all your initiatives and their progress here.',
    position: 'right'
  },
  {
    selector: '#global-search',
    title: 'Search Projects',
    content: 'Find any project by name, status, or associated contact.',
    position: 'bottom'
  },
  {
    selector: '#guided-tour-button',
    title: 'Need Help?',
    content: 'Click here anytime to restart this guided tour.',
    position: 'left'
  }
];

// Donations tour steps
export const donationsTourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation',
    content: 'You are viewing Donations. Track all gifts and manage donor relationships.',
    position: 'right'
  },
  {
    selector: '#global-search',
    title: 'Search Donations',
    content: 'Find donations by donor name, amount, campaign, or date.',
    position: 'bottom'
  },
  {
    selector: '#guided-tour-button',
    title: 'Need Help?',
    content: 'Click here anytime to restart this guided tour.',
    position: 'left'
  }
];

// Calendar tour steps
export const calendarTourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation',
    content: 'You are viewing the Calendar. See all events, tasks, and deadlines.',
    position: 'right'
  },
  {
    selector: '#global-search',
    title: 'Search Events',
    content: 'Find events by title, attendees, or date.',
    position: 'bottom'
  },
  {
    selector: '#guided-tour-button',
    title: 'Need Help?',
    content: 'Click here anytime to restart this guided tour.',
    position: 'left'
  }
];

// Tasks tour steps
export const tasksTourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation',
    content: 'You are viewing Tasks. Manage your to-do list and track progress.',
    position: 'right'
  },
  {
    selector: '#global-search',
    title: 'Search Tasks',
    content: 'Find tasks by title, status, or assignee.',
    position: 'bottom'
  },
  {
    selector: '#guided-tour-button',
    title: 'Need Help?',
    content: 'Click here anytime to restart this guided tour.',
    position: 'left'
  }
];

// Cases tour steps
export const casesTourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation',
    content: 'You are viewing Cases. Track client cases and service delivery.',
    position: 'right'
  },
  {
    selector: '#global-search',
    title: 'Search Cases',
    content: 'Find cases by title, client, or status.',
    position: 'bottom'
  },
  {
    selector: '#guided-tour-button',
    title: 'Need Help?',
    content: 'Click here anytime to restart this guided tour.',
    position: 'left'
  }
];

// Team tour steps
export const teamTourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation',
    content: 'You are viewing Team Management. See all team members and their roles.',
    position: 'right'
  },
  {
    selector: '#global-search',
    title: 'Search Team',
    content: 'Find team members by name, role, or email.',
    position: 'bottom'
  },
  {
    selector: '#guided-tour-button',
    title: 'Need Help?',
    content: 'Click here anytime to restart this guided tour.',
    position: 'left'
  }
];

// Volunteers tour steps
export const volunteersTourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation',
    content: 'You are viewing Volunteers. Manage volunteer records and hours.',
    position: 'right'
  },
  {
    selector: '#global-search',
    title: 'Search Volunteers',
    content: 'Find volunteers by name, skills, or availability.',
    position: 'bottom'
  },
  {
    selector: '#guided-tour-button',
    title: 'Need Help?',
    content: 'Click here anytime to restart this guided tour.',
    position: 'left'
  }
];

// Settings tour steps
export const settingsTourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation',
    content: 'You are in Settings. Configure your CRM preferences here.',
    position: 'right'
  },
  {
    selector: '#guided-tour-button',
    title: 'Need Help?',
    content: 'Click here anytime to restart this guided tour.',
    position: 'left'
  }
];

// Pulse Chat tour steps
export const pulseChatTourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation',
    content: 'You are viewing Pulse Chat. Communicate with your team in real-time.',
    position: 'right'
  },
  {
    selector: '#global-search',
    title: 'Search Messages',
    content: 'Find messages, channels, or team members.',
    position: 'bottom'
  },
  {
    selector: '#guided-tour-button',
    title: 'Need Help?',
    content: 'Click here anytime to restart this guided tour.',
    position: 'left'
  }
];

// AI Tools tour steps
export const aiToolsTourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation',
    content: 'You are viewing AI Tools. Get intelligent assistance for your work.',
    position: 'right'
  },
  {
    selector: '#global-search',
    title: 'Search',
    content: 'AI can help you find information across your entire CRM.',
    position: 'bottom'
  },
  {
    selector: '#guided-tour-button',
    title: 'Need Help?',
    content: 'Click here anytime to restart this guided tour.',
    position: 'left'
  }
];

// Default tour steps - always available elements
export const defaultTourSteps: TourStep[] = [
  {
    selector: '#main-sidebar',
    title: 'Navigation Sidebar',
    content: 'Access all sections of your CRM from here. Click any item to navigate.',
    position: 'right'
  },
  {
    selector: '#global-search',
    title: 'Global Search',
    content: 'Search across all your data - contacts, projects, donations, and more.',
    position: 'bottom'
  },
  {
    selector: '#guided-tour-button',
    title: 'Help Tours',
    content: 'Click here anytime to get a guided tour of the current page.',
    position: 'left'
  }
];

// Page to tour steps mapping
export const pageTourStepsMap: Record<string, TourStep[]> = {
  'dashboard': dashboardTourSteps,
  'contacts': contactsTourSteps,
  'projects': projectsTourSteps,
  'project-hub': projectsTourSteps,
  'donations': donationsTourSteps,
  'calendar': calendarTourSteps,
  'tasks': tasksTourSteps,
  'case': casesTourSteps,
  'cases': casesTourSteps,
  'team': teamTourSteps,
  'volunteers': volunteersTourSteps,
  'settings': settingsTourSteps,
  'pulse-chat': pulseChatTourSteps,
  'ai-tools': aiToolsTourSteps,
};

// Get tour steps for a specific page
export function getTourStepsForPage(page: string): TourStep[] {
  const steps = pageTourStepsMap[page];
  if (steps && steps.length > 0) {
    return steps;
  }
  return defaultTourSteps;
}
