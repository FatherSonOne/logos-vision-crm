import React from 'react';
import type { Page } from '../types';
import {
  DashboardIcon, FolderIcon, CaseIcon, ClipboardListIcon,
  HeartIcon, CheckSquareIcon, CalendarIcon, SettingsIcon,
  DocumentsIcon, ReportsIcon, BriefcaseIcon, ImpactIcon,
  ForgeIcon, UsersIcon, CloudIcon, LayoutIcon
} from './icons';

// Outreach Hub icon
const OutreachHubIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// Connect Hub icon - represents communication/sync hub
const ConnectHubIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// Timeline icon - vertical timeline/activity feed
const TimelineIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
    <line x1="12" y1="7" x2="12" y2="10" />
    <line x1="12" y1="14" x2="12" y2="17" />
  </svg>
);

// --- CONFIGURATION ---

export interface NavItemConfig {
  pageId: Page;
  label: string;
  icon: React.ReactNode;
}

export interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

export const mainNav: NavItemConfig = {
    pageId: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />
};

/**
 * Streamlined Navigation Structure
 * =================================
 * Optimized for focused CRM workflow
 *
 * TABLED (removed from nav, to be developed later):
 * - Households: will be moved into Case Management
 * - Web Management: serves no purpose currently
 * - Calendar Settings: moved to within Calendar or Settings
 * - Analytics: moved into Outreach Hub as internal tab
 * - Impact Reports: moved into Impact as internal tab
 * - AI Suite: consolidated into single Forge entry
 * - Client Suite: tabled for now
 */
export const navigationSections: NavSectionConfig[] = [
    {
        title: 'Manage',
        items: [
            { pageId: 'contacts', label: 'Contacts', icon: <UsersIcon /> },
            { pageId: 'projects', label: 'Projects', icon: <FolderIcon /> },
            { pageId: 'case', label: 'Case Management', icon: <CaseIcon /> },
            { pageId: 'activities', label: 'Activities', icon: <ClipboardListIcon /> },
        ]
    },
    {
        title: 'Outreach',
        items: [
            // Outreach Hub now includes Analytics as internal tab
            { pageId: 'outreach-hub', label: 'Outreach Hub', icon: <OutreachHubIcon /> },
            { pageId: 'charity', label: 'Charity Hub', icon: <HeartIcon /> },
        ]
    },
    {
        title: 'Workspace',
        items: [
            { pageId: 'tasks', label: 'Tasks', icon: <CheckSquareIcon /> },
            { pageId: 'calendar', label: 'Calendar', icon: <CalendarIcon /> },
            { pageId: 'relationship-timeline', label: 'Timeline', icon: <TimelineIcon /> },
            { pageId: 'documents', label: 'Documents', icon: <DocumentsIcon /> },
            { pageId: 'reports', label: 'Reports', icon: <ReportsIcon /> },
            // Impact now includes Impact Reports as internal tab
            { pageId: 'impact', label: 'Impact', icon: <ImpactIcon /> },
            { pageId: 'team', label: 'Team', icon: <BriefcaseIcon /> },
        ]
    },
    {
        title: 'Connect',
        items: [
            // Connect Hub - central communication sync for Pulse & Entomate
            { pageId: 'connect', label: 'Connect Hub', icon: <ConnectHubIcon /> },
        ]
    },
    {
        title: 'Forge',
        items: [
            // Consolidated AI tools: AI Tools, Form Generator, Grant Assistant
            // Internal navigation within Forge component
            { pageId: 'forge', label: 'AI Forge', icon: <ForgeIcon /> },
        ]
    },
    {
        title: 'System',
        items: [
            { pageId: 'settings', label: 'Settings', icon: <SettingsIcon /> },
            { pageId: 'design-preview', label: 'Design Preview', icon: <LayoutIcon /> },
        ]
    }
];

export const allNavItems: NavItemConfig[] = [
    mainNav,
    ...navigationSections.flatMap(s => s.items)
];
