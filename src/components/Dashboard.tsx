import React, { useMemo, useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import type { Project, Client, Activity, Page, TeamMember, Case, EnrichedTask, Donation, Document as AppDocument } from '../types';
import { ProjectStatus, ActivityType, ActivityStatus, TaskStatus } from '../types';
import { getDeadlineStatus } from '../utils/dateHelpers';
import { generateDailyBriefing, type DailyBriefingResult, type BriefingData } from '../services/geminiService';
import { Skeleton, CardSkeleton as StatCardSkeleton, ListSkeleton } from './ui/Skeleton';
import { useDonationSummary } from '../hooks/useDonationSummary';
import { Sparkles, CheckCircle, Calendar, Trophy, AlertCircle, RefreshCw, Quote, ArrowRight, Sun, FileText, DollarSign } from 'lucide-react';

// Design System Components
import { StatCard, Card, CardTitle, CardContent, Badge } from './ui';

// Phase 1 Dashboard Widgets - Lazy Loaded for Performance
const DonorRetentionWidget = lazy(() => import('./dashboard/DonorRetentionWidget').then(m => ({ default: m.DonorRetentionWidget })));
const LapsedDonorAlert = lazy(() => import('./dashboard/LapsedDonorAlert').then(m => ({ default: m.LapsedDonorAlert })));
const PledgeFulfillmentWidget = lazy(() => import('./dashboard/PledgeFulfillmentWidget').then(m => ({ default: m.PledgeFulfillmentWidget })));
const ServiceImpactSummary = lazy(() => import('./dashboard/ServiceImpactSummary').then(m => ({ default: m.ServiceImpactSummary })));
const HouseholdStatsWidget = lazy(() => import('./dashboard/HouseholdStatsWidget').then(m => ({ default: m.HouseholdStatsWidget })));
const DonorEngagementWidget = lazy(() => import('./dashboard/DonorEngagementWidget').then(m => ({ default: m.DonorEngagementWidget })));
const SentimentHealthWidget = lazy(() => import('./dashboard/SentimentHealthWidget').then(m => ({ default: m.SentimentHealthWidget })));
const OpportunityScoutWidget = lazy(() => import('./dashboard/OpportunityScoutWidget').then(m => ({ default: m.OpportunityScoutWidget })));
const MeetingPrepWidget = lazy(() => import('./dashboard/MeetingPrepWidget').then(m => ({ default: m.MeetingPrepWidget })));
const ProjectRiskRadarWidget = lazy(() => import('./dashboard/ProjectRiskRadarWidget').then(m => ({ default: m.ProjectRiskRadarWidget })));
const ResourceAllocatorWidget = lazy(() => import('./dashboard/ResourceAllocatorWidget').then(m => ({ default: m.ResourceAllocatorWidget })));

// New Tier 1 & 2 Components
import { DashboardCustomizer, useDashboardPreferences } from '@/components/DashboardCustomizer';
import { ActivityFeed as CollaborationActivityFeed, TeamPresenceBar } from '@/components/CollaborationFeatures';
import { EnhancedDashboardCustomizer } from './EnhancedDashboardCustomizer';

// Dashboard Role Types - Extended with specialized roles
export type DashboardRole = 'fundraising' | 'programs' | 'leadership' | 'grants' | 'volunteers' | 'custom';

export interface DashboardConfig {
  role: DashboardRole;
  expandedWidgets: string[];
  collapsedWidgets: string[];
  hiddenWidgets: string[];
}

const DEFAULT_CONFIG: DashboardConfig = {
  role: 'leadership',
  expandedWidgets: [],
  collapsedWidgets: [],
  hiddenWidgets: [],
};

// Widget metadata for display and role filtering
interface WidgetMeta {
  id: string;
  title: string;
  roles: DashboardRole[];
  defaultCollapsed?: boolean;
}

const WIDGET_DEFINITIONS: WidgetMeta[] = [
  { id: 'briefing', title: 'Daily Briefing', roles: ['fundraising', 'programs', 'leadership', 'grants', 'volunteers', 'custom'] },
  { id: 'donations', title: 'Donations This Year', roles: ['fundraising', 'leadership', 'grants'] },
  { id: 'retention', title: 'Donor Retention', roles: ['fundraising', 'leadership'] },
  { id: 'lapsed', title: 'Lapsed Donors', roles: ['fundraising'] },
  { id: 'pledges', title: 'Pledge Fulfillment', roles: ['fundraising', 'leadership', 'grants'] },
  { id: 'engagement', title: 'Donor Engagement', roles: ['fundraising'] },
  { id: 'sentiment', title: 'Sentiment Health', roles: ['fundraising', 'leadership'] },
  { id: 'opportunities', title: 'Opportunity Scout', roles: ['fundraising', 'leadership'] },
  { id: 'meeting-prep', title: 'Meeting Prep', roles: ['fundraising', 'programs', 'leadership', 'grants', 'volunteers'] },
  { id: 'project-risk', title: 'Project Risk Radar', roles: ['programs', 'leadership', 'grants'] },
  { id: 'resource-allocator', title: 'Resource Allocator', roles: ['leadership', 'programs'] },
  { id: 'service-impact', title: 'Service Impact', roles: ['programs', 'leadership', 'grants'] },
  { id: 'household', title: 'Household Stats', roles: ['fundraising', 'leadership'] },
  { id: 'projects-deadline', title: 'Projects Nearing Deadline', roles: ['programs', 'leadership', 'grants'] },
  { id: 'activities', title: 'Recent Activities', roles: ['programs', 'leadership', 'volunteers'] },
  { id: 'upcoming', title: 'Upcoming For You', roles: ['fundraising', 'programs', 'leadership', 'grants', 'volunteers'] },
];

// Legacy compatibility - convert to lookup
const WIDGET_ROLES: Record<string, DashboardRole[]> = Object.fromEntries(
  WIDGET_DEFINITIONS.map(w => [w.id, w.roles])
);

// Collapsible Widget Wrapper Component
const CollapsibleWidget: React.FC<{
  id: string;
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ id: _id, title, isCollapsed, onToggle, children }) => {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: 'var(--cmf-surface)',
        border: '1px solid var(--cmf-border)',
      }}
    >
      {/* Collapsible Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:opacity-80 transition-opacity"
        style={{ backgroundColor: isCollapsed ? 'var(--cmf-surface-2)' : 'transparent' }}
      >
        <span
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: 'var(--cmf-text-secondary)' }}
        >
          {title}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
          style={{ color: 'var(--cmf-text-faint)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'
        }`}
      >
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

// Widget Loading Skeleton
const WidgetSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

interface DashboardProps {
  projects: Project[];
  clients: Client[];
  cases: Case[];
  activities: Activity[];
  teamMembers: TeamMember[];
  documents?: AppDocument[];
  donations?: Donation[];
  currentUserId: string;
  onSelectProject: (id: string) => void;
  setCurrentPage: (page: Page) => void;
  onScheduleEvent: () => void;
}

interface EnhancedHeroWidgetProps extends BriefingData {
  onNavigate: (page: Page, id?: string, type?: string) => void;
}

const EnhancedHeroWidget: React.FC<EnhancedHeroWidgetProps> = ({ onNavigate, ...data }) => {
    const [briefing, setBriefing] = useState<DailyBriefingResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activePriority, setActivePriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

    const getBriefing = useCallback(async () => {
        setIsLoading(true);
        // Pre-enrich tasks with project info if needed, though geminiService does some filtering
        // We pass the data directly as geminiService expects BriefingData
        const result = await generateDailyBriefing(data);
        setBriefing(result);
        setIsLoading(false);
    }, [data.projects, data.cases, data.activities, data.tasks, data.donations, data.documents]);

    useEffect(() => {
        getBriefing();
    }, [getBriefing]);

    const handleActionClick = (item: { relatedId?: string, relatedType?: string }) => {
        if (item.relatedType && item.relatedId) {
            let page: Page | null = null;
            switch (item.relatedType) {
                case 'task': page = 'tasks'; break;
                case 'project': page = 'projects'; break; // Special handling might be needed for selection
                case 'case': page = 'case'; break;
                case 'activity': page = 'activities'; break;
                case 'document': page = 'documents'; break;
                case 'donation': page = 'donations'; break;
            }
            if (page) {
                onNavigate(page, item.relatedId, item.relatedType);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white shadow-xl p-8 min-h-[300px] animate-pulse">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Sparkles size={120} />
                </div>
                <div className="space-y-4 max-w-2xl relative z-10">
                    <div className="h-8 bg-white/10 rounded w-1/3 mb-6"></div>
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                    <div className="h-4 bg-white/10 rounded w-5/6"></div>
                    <div className="h-4 bg-white/10 rounded w-4/6"></div>
                </div>
                <div className="grid grid-cols-3 gap-6 mt-8 relative z-10">
                    <div className="h-24 bg-white/5 rounded-lg"></div>
                    <div className="h-24 bg-white/5 rounded-lg"></div>
                    <div className="h-24 bg-white/5 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (!briefing) return null;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white shadow-xl transition-all duration-500">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 p-6 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-indigo-200 text-sm font-medium tracking-wide uppercase">
                            <Sun size={16} />
                            <span>Daily Briefing</span>
                            <span className="mx-2 text-indigo-500/50">•</span>
                            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100">
                            {briefing.greeting}
                        </h2>
                    </div>
                    <button
                        onClick={getBriefing}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-indigo-100 transition-colors backdrop-blur-sm"
                        title="Refresh Briefing"
                        aria-label="Refresh daily briefing"
                    >
                        <RefreshCw size={20} aria-hidden="true" />
                    </button>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Summary & Actions (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Executive Summary */}
                        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
                            <p className="text-lg leading-relaxed text-indigo-50 font-light">
                                {briefing.summary}
                            </p>
                            {briefing.quote && (
                                <div className="mt-4 flex items-start gap-3 pt-4 border-t border-white/10 text-indigo-200/80 italic text-sm">
                                    <Quote size={16} className="shrink-0 mt-0.5" />
                                    <span>"{briefing.quote}"</span>
                                </div>
                            )}
                        </div>

                        {/* Action Items - Enhanced with Priority Filter */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-indigo-100">
                                    <CheckCircle size={20} className="text-emerald-400" />
                                    Action Items
                                </h3>

                                {/* Priority Filter Tabs */}
                                <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
                                    {(['all', 'high', 'medium', 'low'] as const).map(priority => (
                                        <button
                                            key={priority}
                                            className={`px-2 py-1 text-xs rounded transition-all ${
                                                activePriority === priority
                                                    ? 'bg-white/10 text-white font-medium'
                                                    : 'text-indigo-300 hover:text-white'
                                            }`}
                                            onClick={() => setActivePriority(priority)}
                                        >
                                            {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-3">
                                {briefing.actionItems.length > 0 ? (
                                    briefing.actionItems
                                        .filter(item => activePriority === 'all' || item.priority === activePriority)
                                        .map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-3 bg-white/5 hover:bg-white/10 transition-all p-4 rounded-xl border border-white/5 group"
                                        >
                                            {/* Priority Indicator */}
                                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                                                item.priority === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse' :
                                                item.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                                            }`} />

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-indigo-50 group-hover:text-white transition-colors mb-2">
                                                    {item.text}
                                                </p>

                                                {/* Quick Actions - Shown on Hover */}
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="px-2 py-1 text-xs bg-emerald-600/20 text-emerald-300 rounded hover:bg-emerald-600/30 transition-colors">
                                                        Mark Done
                                                    </button>
                                                    <button className="px-2 py-1 text-xs bg-indigo-600/20 text-indigo-300 rounded hover:bg-indigo-600/30 transition-colors">
                                                        Snooze
                                                    </button>
                                                    {item.relatedType && item.relatedId && (
                                                        <button
                                                            onClick={() => handleActionClick(item)}
                                                            className="px-2 py-1 text-xs bg-white/5 text-indigo-300 rounded hover:bg-white/10 transition-colors flex items-center gap-1"
                                                        >
                                                            <ArrowRight size={12} />
                                                            <span className="capitalize">View {item.relatedType}</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-indigo-300/60 italic">
                                        {activePriority === 'all'
                                            ? 'No urgent actions suggested for today.'
                                            : `No ${activePriority} priority actions.`}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Highlights & Kudos (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Kudos / Wins */}
                        {(briefing.kudos.length > 0 || briefing.recap.length > 0) && (
                            <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 backdrop-blur-md rounded-xl p-5 border border-emerald-500/20">
                                <h3 className="text-sm font-bold text-emerald-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Trophy size={16} /> Highlights
                                </h3>
                                <ul className="space-y-3">
                                    {[...briefing.kudos, ...briefing.recap].slice(0, 3).map((item, i) => (
                                        <li key={i} className="text-sm text-emerald-50 flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 bg-emerald-400 rounded-full shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Reminders */}
                        <div className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10">
                            <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <AlertCircle size={16} /> Reminders
                            </h3>
                            <ul className="space-y-3">
                                {briefing.reminders.length > 0 ? (
                                    briefing.reminders.map((item, i) => (
                                        <li key={i} className="text-sm text-amber-50 flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 bg-amber-400 rounded-full shrink-0" />
                                            {item}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-sm text-indigo-300/60 italic">No pending reminders.</li>
                                )}
                            </ul>
                        </div>
                        
                        {/* Quick Stats Mini-Row (if data available) */}
                         <div className="grid grid-cols-2 gap-2">
                            {data.donations && data.donations.length > 0 && (
                                <div className="bg-white/5 p-3 rounded-lg text-center">
                                    <div className="text-xs text-indigo-300 mb-1">Recent Gifts</div>
                                    <div className="text-lg font-bold text-white">
                                        {data.donations.filter(d => new Date(d.date) > new Date(Date.now() - 7 * 86400000)).length}
                                    </div>
                                </div>
                            )}
                             {data.tasks && (
                                <div className="bg-white/5 p-3 rounded-lg text-center">
                                    <div className="text-xs text-indigo-300 mb-1">Due Soon</div>
                                    <div className="text-lg font-bold text-white">
                                        {data.tasks.filter(t => t.status !== TaskStatus.Done && new Date(t.dueDate) <= new Date(Date.now() + 7 * 86400000)).length}
                                    </div>
                                </div>
                            )}
                         </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

const RefreshIcon: React.FC<{ isLoading: boolean }> = ({ isLoading }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0121.5 13.5M20 20l-1.5-1.5A9 9 0 012.5 10.5" />
    </svg>
);


const ActivityIcon: React.FC<{type: ActivityType; minimal?: boolean}> = ({ type, minimal }) => {
    const icons = {
        [ActivityType.Call]: <PhoneIcon />,
        [ActivityType.Email]: <MailIcon />,
        [ActivityType.Meeting]: <UsersIcon />,
        [ActivityType.Note]: <DocumentTextIcon />,
    };
    const colors = {
        [ActivityType.Call]: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400',
        [ActivityType.Email]: 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400',
        [ActivityType.Meeting]: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400',
        [ActivityType.Note]: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    }
    if (minimal) {
        return <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/50 text-slate-600 dark:bg-white/20 dark:text-slate-200 shadow-inner">{icons[type]}</div>;
    }
    return <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${colors[type]}`}>{icons[type]}</div>;
}

const TaskIcon = () => (
    <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white/50 text-slate-600 dark:bg-white/20 dark:text-slate-200 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    </div>
);


const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
};

const ProjectsNearingDeadline: React.FC<{ projects: Project[], onSelectProject: (id: string) => void }> = ({ projects, onSelectProject }) => {
    const nearingDeadline = useMemo(() => {
        return projects
            .filter(p => p.status !== ProjectStatus.Completed)
            .map(p => ({ ...p, deadline: getDeadlineStatus(p.endDate) }))
            .filter(p => p.deadline.status !== 'completed')
            .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
            .slice(0, 5);
    }, [projects]);

    return (
        <Card>
            <CardTitle>Projects Nearing Deadline</CardTitle>
            <CardContent className="mt-4">
                <ul className="space-y-4">
                    {nearingDeadline.length > 0 ? nearingDeadline.map(project => (
                        <li key={project.id}>
                            <button onClick={() => onSelectProject(project.id)} className="w-full text-left group">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-semibold text-slate-800 group-hover:text-rose-600 dark:text-slate-100 dark:group-hover:text-rose-400 truncate pr-2">{project.name}</span>
                                    <span className={`font-semibold ${project.deadline.color} flex-shrink-0`}>{project.deadline.text}</span>
                                </div>
                            </button>
                        </li>
                    )) : (
                        <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-8">No upcoming project deadlines.</p>
                    )}
                </ul>
            </CardContent>
        </Card>
    );
}

const DashboardSkeleton: React.FC = () => (
    <div className="space-y-8">
        <Skeleton className="h-[148px] w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/20 dark:bg-slate-900/40 p-6 rounded-lg border border-white/20">
                    <Skeleton className="h-6 w-1/3 mb-4" />
                    <ListSkeleton items={4} />
                </div>
                <div className="bg-white/20 dark:bg-slate-900/40 p-6 rounded-lg border border-white/20">
                    <Skeleton className="h-6 w-1/3 mb-4" />
                    <ListSkeleton items={5} />
                </div>
            </div>
            <div className="bg-white/20 dark:bg-slate-900/40 p-6 rounded-lg border border-white/20">
                <Skeleton className="h-6 w-1/2 mb-4" />
                <ListSkeleton items={5} />
            </div>
        </div>
    </div>
);


// Dashboard Role Selector Component - With expanded role options
const DashboardRoleSelector: React.FC<{
  currentRole: DashboardRole;
  onRoleChange: (role: DashboardRole) => void;
}> = ({ currentRole, onRoleChange }) => {
  const [showMore, setShowMore] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const primaryRoles: { id: DashboardRole; label: string; description: string }[] = [
    { id: 'leadership', label: 'Leadership', description: 'Executive overview' },
    { id: 'fundraising', label: 'Fundraising', description: 'Donor-focused' },
    { id: 'programs', label: 'Programs', description: 'Service delivery' },
  ];

  const moreRoles: { id: DashboardRole; label: string; description: string }[] = [
    { id: 'grants', label: 'Grants', description: 'Grant writer focus' },
    { id: 'volunteers', label: 'Volunteers', description: 'Volunteer coordination' },
    { id: 'custom', label: 'Custom', description: 'Show all widgets' },
  ];

  const allRoles = [...primaryRoles, ...moreRoles];
  const currentRoleData = allRoles.find(r => r.id === currentRole);
  const isMoreRole = moreRoles.some(r => r.id === currentRole);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    };

    if (showMore) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMore]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--cmf-surface-2)' }}>
        {primaryRoles.map((role) => (
          <button
            key={role.id}
            onClick={() => onRoleChange(role.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              currentRole === role.id ? 'shadow-sm' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: currentRole === role.id ? 'var(--cmf-surface)' : 'transparent',
              color: currentRole === role.id ? 'var(--cmf-accent)' : 'var(--cmf-text-secondary)',
            }}
            title={role.description}
          >
            {role.label}
          </button>
        ))}

        {/* More dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowMore(!showMore)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1 ${
              isMoreRole ? 'shadow-sm' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: isMoreRole ? 'var(--cmf-surface)' : 'transparent',
              color: isMoreRole ? 'var(--cmf-accent)' : 'var(--cmf-text-secondary)',
            }}
          >
            {isMoreRole ? currentRoleData?.label : 'More'}
            <svg className={`w-3 h-3 transition-transform ${showMore ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMore && (
            <div
              className="absolute right-0 mt-1 py-1 rounded-lg shadow-lg z-[9999] min-w-[140px]"
              style={{
                backgroundColor: 'var(--cmf-surface)',
                border: '1px solid var(--cmf-border)',
                top: '100%',
              }}
            >
              {moreRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    onRoleChange(role.id);
                    setShowMore(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:opacity-80 transition-opacity flex flex-col"
                  style={{
                    color: currentRole === role.id ? 'var(--cmf-accent)' : 'var(--cmf-text)',
                    backgroundColor: currentRole === role.id ? 'var(--cmf-accent-muted)' : 'transparent',
                  }}
                >
                  <span className="font-medium">{role.label}</span>
                  <span className="text-xs" style={{ color: 'var(--cmf-text-faint)' }}>{role.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  clients, 
  cases, 
  activities, 
  teamMembers, 
  currentUserId, 
  onSelectProject, 
  setCurrentPage, 
  onScheduleEvent,
  documents = [],
  donations = []
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Dashboard configuration state with localStorage persistence
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(() => {
    const saved = localStorage.getItem('dashboardConfig');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  // Dashboard customizer preferences
  const dashboardPreferences = useDashboardPreferences();

  // Save config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('dashboardConfig', JSON.stringify(dashboardConfig));
  }, [dashboardConfig]);

  const handleRoleChange = (role: DashboardRole) => {
    setDashboardConfig(prev => ({ ...prev, role }));
  };

  // Check if a widget should be visible based on role
  const isWidgetVisible = (widgetId: string): boolean => {
    if (dashboardConfig.hiddenWidgets.includes(widgetId)) return false;
    if (dashboardConfig.role === 'custom') return true;
    const allowedRoles = WIDGET_ROLES[widgetId] || [];
    return allowedRoles.includes(dashboardConfig.role);
  };

  // Check if a widget is collapsed
  const isWidgetCollapsed = (widgetId: string): boolean => {
    return dashboardConfig.collapsedWidgets.includes(widgetId);
  };

  // Toggle widget collapse state
  const toggleWidgetCollapse = (widgetId: string) => {
    setDashboardConfig(prev => ({
      ...prev,
      collapsedWidgets: prev.collapsedWidgets.includes(widgetId)
        ? prev.collapsedWidgets.filter(id => id !== widgetId)
        : [...prev.collapsedWidgets, widgetId],
    }));
  };

  // Handler for toggling widget visibility in customizer
  const handleToggleWidget = (widgetId: string) => {
    setDashboardConfig(prev => ({
      ...prev,
      hiddenWidgets: prev.hiddenWidgets.includes(widgetId)
        ? prev.hiddenWidgets.filter(id => id !== widgetId)
        : [...prev.hiddenWidgets, widgetId]
    }));
  };

  // Handler for applying layout presets
  const handleApplyPreset = (preset: { defaultCollapsed: string[]; defaultHidden: string[] }) => {
    setDashboardConfig(prev => ({
      ...prev,
      collapsedWidgets: preset.defaultCollapsed,
      hiddenWidgets: preset.defaultHidden
    }));
  };

  // Handler for resetting to default configuration
  const handleResetToDefaults = () => {
    const DEFAULT_CONFIG: DashboardConfig = {
      role: 'leadership',
      expandedWidgets: [],
      collapsedWidgets: [],
      hiddenWidgets: [],
    };
    setDashboardConfig(DEFAULT_CONFIG);
    localStorage.setItem('dashboardConfig', JSON.stringify(DEFAULT_CONFIG));
  };

  // Get role description for subtitle
  const getRoleDescription = (role: DashboardRole): string => {
    const descriptions: Record<DashboardRole, string> = {
      leadership: 'Executive overview of your organization',
      fundraising: 'Donor and fundraising metrics',
      programs: 'Service delivery and impact',
      grants: 'Grant reporting and compliance data',
      volunteers: 'Volunteer coordination and activities',
      custom: 'Your customized view showing all widgets',
    };
    return descriptions[role];
  };

  // Get role-specific greeting for header
  const getRoleGreeting = (role: DashboardRole): string => {
    const greetings: Record<DashboardRole, string> = {
      leadership: 'Leadership Dashboard',
      fundraising: 'Fundraising Hub',
      programs: 'Programs Overview',
      grants: 'Grants & Compliance',
      volunteers: 'Volunteer Center',
      custom: 'Custom Dashboard',
    };
    return greetings[role];
  };

  // Computed stats - FIXED: Proper calculations
  const organizations = useMemo(() =>
    clients.filter(c => c.organization && c.organization.trim() !== ''),
    [clients]
  );

  const contactsCount = clients.length;
  const organizationsCount = new Set(organizations.map(c => c.organization)).size;

  const pipelineValue = useMemo(() => {
    const activeProjectBudgets = projects
      .filter(p => p.status === ProjectStatus.InProgress || p.status === ProjectStatus.Planning)
      .reduce((sum, p) => sum + (p.budget || 0), 0);
    return activeProjectBudgets;
  }, [projects]);

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const activeProjects = projects.filter(p => p.status === ProjectStatus.InProgress).length;
  const totalProjects = projects.length;
  const recentActivities = activities.slice(0, 5);
  const currentUser = useMemo(() => teamMembers.find(tm => tm.id === currentUserId), [teamMembers, currentUserId]);
  const donationSummary = useDonationSummary();

  const myTasks = useMemo(() => 
    projects.flatMap(p => 
      p.tasks.map(t => ({...t, projectName: p.name, projectId: p.id}))
    ).filter(task => task.teamMemberId === currentUserId),
  [projects, currentUserId]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const getClientName = (clientId: string | null | undefined) => {
      if (!clientId) return 'Internal';
      return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  }

  const upcomingItems = useMemo(() => {
    const myTasks = projects.flatMap(p => p.tasks.map(t => ({...t, projectName: p.name, projectId: p.id})))
      .filter(task => task.teamMemberId === currentUserId && task.status !== TaskStatus.Done);
      
    const scheduledActivities = activities.filter(act => act.status === ActivityStatus.Scheduled);

    const combined = [
      ...myTasks.map(task => ({
        id: task.id,
        date: new Date(task.dueDate),
        title: task.description,
        type: 'Task',
        context: `Project: ${task.projectName}`,
        icon: <TaskIcon />,
        onClick: () => setCurrentPage('tasks')
      })),
      ...scheduledActivities.map(act => ({
        id: act.id,
        date: new Date(`${act.activityDate}T${act.activityTime || '00:00:00'}`),
        title: act.title,
        type: act.type,
        context: act.clientId ? `Client: ${getClientName(act.clientId)}` : 'Internal',
        icon: <ActivityIcon type={act.type} minimal />,
        onClick: () => setCurrentPage('activities')
      }))
    ];

    return combined.sort((a,b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
  }, [projects, activities, currentUserId, getClientName, setCurrentPage]);

  if (isLoading) {
      return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Daily Briefing - First Widget */}
      <div id="dashboard-briefing">
      {(isWidgetVisible('briefing') || dashboardConfig.role === 'custom') && (
        <EnhancedHeroWidget 
            userName={currentUser?.name || 'User'}
            projects={projects}
            cases={cases}
            activities={activities}
            tasks={myTasks}
            clients={clients}
            documents={documents}
            donations={donations}
            onNavigate={(page, id, type) => {
                if (type === 'project' && id) {
                    onSelectProject(id);
                } else {
                    setCurrentPage(page);
                }
            }}
        />
      )}
      </div>

      {/* Enhanced Dashboard Context Bar - Below Daily Briefing */}
      <div
        className="rounded-xl border transition-all p-6"
        style={{
          backgroundColor: 'var(--cmf-surface)',
          borderColor: 'var(--cmf-border)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Title & Context */}
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--cmf-text)' }}>
                  {getRoleGreeting(dashboardConfig.role)}
                </h2>
                <span
                  className="px-2.5 py-0.5 text-xs font-semibold rounded-full"
                  style={{
                    backgroundColor: 'var(--cmf-accent-muted)',
                    color: 'var(--cmf-accent)'
                  }}
                >
                  {dashboardConfig.role}
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--cmf-text-secondary)' }}>
                {getRoleDescription(dashboardConfig.role)}
              </p>
            </div>
          </div>

          {/* Right: Quick Stats & Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick Stats Card */}
            <div
              className="flex items-center gap-4 px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--cmf-surface-2)' }}
            >
              <div className="text-center">
                <div className="text-xs" style={{ color: 'var(--cmf-text-faint)' }}>Tasks Due</div>
                <div className="text-lg font-bold" style={{ color: 'var(--cmf-accent)' }}>
                  {myTasks.filter(t => t.status !== TaskStatus.Done).length}
                </div>
              </div>
              <div className="w-px h-8" style={{ backgroundColor: 'var(--cmf-border)' }} />
              <div className="text-center">
                <div className="text-xs" style={{ color: 'var(--cmf-text-faint)' }}>This Week</div>
                <div className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>
                  {formatCurrency(donationSummary.weekTotal)}
                </div>
              </div>
            </div>

            {/* Role Selector */}
            <DashboardRoleSelector currentRole={dashboardConfig.role} onRoleChange={handleRoleChange} />

            {/* Customize Button - Enhanced */}
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--cmf-accent-muted)',
                color: 'var(--cmf-accent)',
                border: '1px solid var(--cmf-accent-subtle)'
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Customize</span>
            </button>

            {/* Export/Share Button */}
            <button
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--cmf-surface-2)',
                color: 'var(--cmf-text-secondary)'
              }}
              title="Export Dashboard"
              aria-label="Export dashboard"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div id="dashboard-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Organizations"
          value={organizationsCount}
          subtitle={`${contactsCount} total contacts`}
          icon={<BuildingIcon />}
          gradient="from-blue-500 to-cyan-600"
          onClick={() => setCurrentPage('contacts')}
        />
        <StatCard
          title="Total Contacts"
          value={contactsCount}
          subtitle="All contacts"
          icon={<UsersIcon />}
          gradient="from-green-500 to-emerald-600"
          onClick={() => setCurrentPage('contacts')}
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(pipelineValue)}
          subtitle={`${activeProjects} active projects`}
          icon={<DollarSignIcon />}
          gradient="from-purple-500 to-pink-600"
          onClick={() => setCurrentPage('projects')}
        />
        <StatCard
          id="stat-card-active-projects"
          title="Active Projects"
          value={activeProjects}
          subtitle={`${totalProjects} total projects`}
          icon={<TrendingUpIcon />}
          gradient="from-orange-500 to-red-600"
          onClick={() => setCurrentPage('projects')}
        />
      </div>

      {/* Key Performance Indicators Section - Role-based visibility with collapsible widgets */}
      <div id="dashboard-kpis" className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--cmf-text)' }}>Key Performance Indicators</h2>
          <p className="text-sm" style={{ color: 'var(--cmf-text-faint)' }}>
            {dashboardConfig.role === 'custom' ? 'All widgets' : `${dashboardConfig.role} view`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Donations Summary - Fundraising, Leadership & Grants */}
          {isWidgetVisible('donations') && (
            <CollapsibleWidget
              id="donations"
              title={donationSummary.thisYearCount > 0 ? `Donations ${donationSummary.currentYear}` : `Donations ${donationSummary.lastYear}`}
              isCollapsed={isWidgetCollapsed('donations')}
              onToggle={() => toggleWidgetCollapse('donations')}
            >
              <div className="space-y-3">
                {donationSummary.loading ? (
                  <div className="h-8 w-28 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                ) : donationSummary.thisYearCount > 0 ? (
                  // Show this year's data when available
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-bold" style={{ color: 'var(--cmf-text)' }}>
                        ${donationSummary.thisYearTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}
                      </p>
                      <Badge variant="info" size="sm">{donationSummary.thisYearCount} gifts</Badge>
                    </div>
                    <div className="flex gap-4 text-sm" style={{ color: 'var(--cmf-text-secondary)' }}>
                      <span>Avg: <strong>${donationSummary.averageGiftThisYear.toFixed(0)}</strong></span>
                      <span>{donationSummary.lastYear}: <strong>${donationSummary.lastYearTotal.toLocaleString()}</strong></span>
                    </div>
                  </>
                ) : donationSummary.lastYearCount > 0 ? (
                  // Show last year's data when no data for current year
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-bold" style={{ color: 'var(--cmf-text)' }}>
                        ${donationSummary.lastYearTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}
                      </p>
                      <Badge variant="info" size="sm">{donationSummary.lastYearCount} gifts</Badge>
                    </div>
                    <div className="flex gap-4 text-sm" style={{ color: 'var(--cmf-text-secondary)' }}>
                      <span>Avg: <strong>${donationSummary.averageGiftLastYear.toFixed(0)}</strong></span>
                      <span className="text-amber-600">{donationSummary.currentYear}: No donations yet</span>
                    </div>
                  </>
                ) : (
                  // No data at all
                  <div className="text-center py-4" style={{ color: 'var(--cmf-text-secondary)' }}>
                    <p>No donation data available</p>
                  </div>
                )}
              </div>
            </CollapsibleWidget>
          )}

          {/* Donor Retention - Fundraising & Leadership */}
          {isWidgetVisible('retention') && (
            <CollapsibleWidget
              id="retention"
              title="Donor Retention"
              isCollapsed={isWidgetCollapsed('retention')}
              onToggle={() => toggleWidgetCollapse('retention')}
            >
              <Suspense fallback={<WidgetSkeleton />}>
                <DonorRetentionWidget />
              </Suspense>
            </CollapsibleWidget>
          )}

          {/* Lapsed Donors - Fundraising only */}
          {isWidgetVisible('lapsed') && (
            <CollapsibleWidget
              id="lapsed"
              title="Lapsed Donors"
              isCollapsed={isWidgetCollapsed('lapsed')}
              onToggle={() => toggleWidgetCollapse('lapsed')}
            >
              <Suspense fallback={<WidgetSkeleton />}>
                <LapsedDonorAlert />
              </Suspense>
            </CollapsibleWidget>
          )}

          {/* Pledge Fulfillment - Fundraising, Leadership & Grants */}
          {isWidgetVisible('pledges') && (
            <CollapsibleWidget
              id="pledges"
              title="Pledge Fulfillment"
              isCollapsed={isWidgetCollapsed('pledges')}
              onToggle={() => toggleWidgetCollapse('pledges')}
            >
              <Suspense fallback={<WidgetSkeleton />}>
                <PledgeFulfillmentWidget />
              </Suspense>
            </CollapsibleWidget>
          )}

          {/* Donor Engagement - Fundraising only */}
          {isWidgetVisible('engagement') && (
            <CollapsibleWidget
              id="engagement"
              title="Donor Engagement"
              isCollapsed={isWidgetCollapsed('engagement')}
              onToggle={() => toggleWidgetCollapse('engagement')}
            >
              <Suspense fallback={<WidgetSkeleton />}>
                <DonorEngagementWidget />
              </Suspense>
            </CollapsibleWidget>
          )}

          {/* Sentiment Health - Fundraising & Leadership */}
          {isWidgetVisible('sentiment') && (
            <CollapsibleWidget
              id="sentiment"
              title="Sentiment Health"
              isCollapsed={isWidgetCollapsed('sentiment')}
              onToggle={() => toggleWidgetCollapse('sentiment')}
            >
              <Suspense fallback={<WidgetSkeleton />}>
                <div className="h-[400px]">
                  <SentimentHealthWidget clients={clients} activities={activities} />
                </div>
              </Suspense>
            </CollapsibleWidget>
          )}

          {/* Opportunity Scout - Fundraising & Leadership */}
          {isWidgetVisible('opportunities') && (
            <CollapsibleWidget
              id="opportunities"
              title="Opportunity Scout"
              isCollapsed={isWidgetCollapsed('opportunities')}
              onToggle={() => toggleWidgetCollapse('opportunities')}
            >
              <Suspense fallback={<WidgetSkeleton />}>
                <div className="h-[400px]">
                  <OpportunityScoutWidget clients={clients} donations={donations} />
                </div>
              </Suspense>
            </CollapsibleWidget>
          )}

          {/* Meeting Prep - All Roles */}
          {isWidgetVisible('meeting-prep') && (
            <CollapsibleWidget
              id="meeting-prep"
              title="Meeting Prep Assistant"
              isCollapsed={isWidgetCollapsed('meeting-prep')}
              onToggle={() => toggleWidgetCollapse('meeting-prep')}
            >
              <Suspense fallback={<WidgetSkeleton />}>
                <div className="h-[400px]">
                  <MeetingPrepWidget activities={activities} clients={clients} />
                </div>
              </Suspense>
            </CollapsibleWidget>
          )}

          {/* Project Risk Radar - Programs & Leadership */}
          {isWidgetVisible('project-risk') && (
            <CollapsibleWidget
              id="project-risk"
              title="Project Risk Radar"
              isCollapsed={isWidgetCollapsed('project-risk')}
              onToggle={() => toggleWidgetCollapse('project-risk')}
            >
              <Suspense fallback={<WidgetSkeleton />}>
                <div className="h-[400px]">
                  <ProjectRiskRadarWidget projects={projects} cases={cases} />
                </div>
              </Suspense>
            </CollapsibleWidget>
          )}

          {/* Resource Allocator - Leadership & Programs */}
          {isWidgetVisible('resource-allocator') && (
            <CollapsibleWidget
              id="resource-allocator"
              title="Resource Allocator"
              isCollapsed={isWidgetCollapsed('resource-allocator')}
              onToggle={() => toggleWidgetCollapse('resource-allocator')}
            >
              <Suspense fallback={<WidgetSkeleton />}>
                <div className="h-[400px]">
                  <ResourceAllocatorWidget teamMembers={teamMembers} projects={projects} />
                </div>
              </Suspense>
            </CollapsibleWidget>
          )}

          {/* Service Impact - Programs, Leadership & Grants */}
          {isWidgetVisible('service-impact') && (
            <CollapsibleWidget
              id="service-impact"
              title="Service Impact"
              isCollapsed={isWidgetCollapsed('service-impact')}
              onToggle={() => toggleWidgetCollapse('service-impact')}
            >
              <Suspense fallback={<WidgetSkeleton />}>
                <ServiceImpactSummary />
              </Suspense>
            </CollapsibleWidget>
          )}

          {/* Household Stats - Fundraising & Leadership */}
          {isWidgetVisible('household') && (
            <CollapsibleWidget
              id="household"
              title="Household Giving"
              isCollapsed={isWidgetCollapsed('household')}
              onToggle={() => toggleWidgetCollapse('household')}
            >
              <Suspense fallback={<WidgetSkeleton />}>
                <HouseholdStatsWidget />
              </Suspense>
            </CollapsibleWidget>
          )}
        </div>
      </div>

      {/* Activity Section - Role-based visibility */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Projects Nearing Deadline - Programs & Leadership */}
          {isWidgetVisible('projects-deadline') && (
            <ProjectsNearingDeadline projects={projects} onSelectProject={onSelectProject} />
          )}

          {/* Recent Activities - Programs & Leadership */}
          {isWidgetVisible('activities') && (
            <Card>
              <CardTitle>Recent Activities</CardTitle>
              <CardContent className="mt-4">
                <ul className="space-y-4">
                  {recentActivities.map(activity => (
                    <li key={activity.id} className="flex items-center gap-4">
                      <ActivityIcon type={activity.type} />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{activity.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{getClientName(activity.clientId)}</p>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{formatTimeAgo(activity.activityDate)}</p>
                    </li>
                  ))}
                  {recentActivities.length === 0 && (
                    <p className="text-slate-600 dark:text-slate-400">No recent activities.</p>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upcoming For You - All roles */}
        {isWidgetVisible('upcoming') && (
          <Card className="flex flex-col">
            <CardTitle>Upcoming For You</CardTitle>
            <CardContent className="mt-4 flex-grow">
              <ul className="space-y-4">
                {upcomingItems.length > 0 ? upcomingItems.map(item => (
                  <li key={`${item.type}-${item.id}`} className="flex items-center gap-3 group cursor-pointer" onClick={item.onClick}>
                    <div className="flex-shrink-0">{item.icon}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400">{item.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{item.date.toLocaleDateString()} - {item.context}</p>
                    </div>
                  </li>
                )) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Nothing upcoming on your schedule.</p>
                  </div>
                )}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Team Presence Bar - Collaboration Feature */}
        <Card className="lg:col-span-1">
          <CardTitle>Team Activity</CardTitle>
          <CardContent>
            <TeamPresenceBar teamMembers={teamMembers.map(tm => ({
              ...tm,
              isOnline: Math.random() > 0.5, // Simulated - would come from real-time presence
              lastActive: '10 minutes ago'
            }))} />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Dashboard Customizer Modal */}
      <EnhancedDashboardCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        currentRole={dashboardConfig.role}
        availableWidgets={WIDGET_DEFINITIONS.filter(w =>
          dashboardConfig.role === 'custom' || w.roles.includes(dashboardConfig.role)
        )}
        hiddenWidgets={dashboardConfig.hiddenWidgets}
        collapsedWidgets={dashboardConfig.collapsedWidgets}
        onToggleWidget={handleToggleWidget}
        onApplyPreset={handleApplyPreset}
        onResetToDefaults={handleResetToDefaults}
      />
    </div>
  );
};

// Icons
function BuildingIcon() { return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4m6 4v-4m6 4v-4m-9 4H7m6 0h-2M7 5h10v4H7V5z" /></svg>; }
function UsersIcon() { return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-3-5.197M15 21a6 6 0 00-9-5.197" /></svg>; }
function DollarSignIcon() { return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m-4 0h8m-8 0a4 4 0 01-4-4V8a4 4 0 014-4h2a4 4 0 014 4v4a4 4 0 01-4 4h-2z" /></svg>; }
function TrendingUpIcon() { return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>; }
function PhoneIcon() { return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>; }
function MailIcon() { return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>; }
function DocumentTextIcon() { return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>; }
function CalendarIcon() { return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>; }
