import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { Project, Client, Activity, Page, TeamMember, Case, EnrichedTask } from '../types';
import { ProjectStatus, ActivityType, ActivityStatus, TaskStatus } from '../types';
import { getDeadlineStatus } from '../utils/dateHelpers';
import { generateDailyBriefing } from '../services/geminiService';
import { Skeleton, CardSkeleton as StatCardSkeleton, ListSkeleton } from './ui/Skeleton';
import { useDonationSummary } from '../hooks/useDonationSummary';

// Design System Components
import { StatCard, Card, CardTitle, CardContent, Badge } from './ui';

// Phase 1 Dashboard Widgets
import { DonorRetentionWidget } from './dashboard/DonorRetentionWidget';
import { LapsedDonorAlert } from './dashboard/LapsedDonorAlert';
import { PledgeFulfillmentWidget } from './dashboard/PledgeFulfillmentWidget';
import { ServiceImpactSummary } from './dashboard/ServiceImpactSummary';
import { HouseholdStatsWidget } from './dashboard/HouseholdStatsWidget';
import { DonorEngagementWidget } from './dashboard/DonorEngagementWidget';

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
  { id: 'donations', title: 'Donations This Year', roles: ['fundraising', 'leadership', 'grants'] },
  { id: 'retention', title: 'Donor Retention', roles: ['fundraising', 'leadership'] },
  { id: 'lapsed', title: 'Lapsed Donors', roles: ['fundraising'] },
  { id: 'pledges', title: 'Pledge Fulfillment', roles: ['fundraising', 'leadership', 'grants'] },
  { id: 'engagement', title: 'Donor Engagement', roles: ['fundraising'] },
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

interface DashboardProps {
  projects: Project[];
  clients: Client[];
  cases: Case[];
  activities: Activity[];
  teamMembers: TeamMember[];
  currentUserId: string;
  onSelectProject: (id: string) => void;
  setCurrentPage: (page: Page) => void;
  onScheduleEvent: () => void;
}

const DailyBriefing: React.FC<{
    userName: string;
    projects: Project[];
    cases: Case[];
    activities: Activity[];
    currentUserId: string;
}> = ({ userName, projects, cases, activities, currentUserId }) => {
    const [briefing, setBriefing] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const getBriefing = useCallback(async () => {
        setIsLoading(true);

        const allTasks: EnrichedTask[] = projects.flatMap(p => 
            p.tasks.map(t => ({...t, projectName: p.name, projectId: p.id}))
        );
        const myTasks = allTasks.filter(t => t.teamMemberId === currentUserId);
        
        const summary = await generateDailyBriefing(userName, myTasks, cases, activities);
        setBriefing(summary);
        setIsLoading(false);
    }, [userName, projects, cases, activities, currentUserId]);

    useEffect(() => {
        getBriefing();
    }, [getBriefing]);

    return (
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-6 rounded-lg shadow-lg text-white overflow-hidden text-shadow-strong">
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-cyan-500/10 rounded-full filter blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-violet-500/10 rounded-full filter blur-2xl"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold">Daily Briefing</h3>
                        <p className="text-sm text-slate-300">Your AI-powered morning summary.</p>
                    </div>
                    <button onClick={getBriefing} disabled={isLoading} className="p-1.5 rounded-full text-slate-300 hover:bg-white/10 disabled:opacity-50" aria-label="Refresh briefing">
                        <RefreshIcon isLoading={isLoading} />
                    </button>
                </div>
                <div className="mt-4 min-h-[72px]">
                    {isLoading ? (
                         <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-700 rounded w-full"></div>
                            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                        </div>
                    ) : (
                        <p className="text-slate-200 whitespace-pre-wrap">{briefing}</p>
                    )}
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
        <div className="relative">
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
              className="absolute right-0 top-full mt-1 py-1 rounded-lg shadow-lg z-50 min-w-[140px]"
              style={{
                backgroundColor: 'var(--cmf-surface)',
                border: '1px solid var(--cmf-border)',
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

export const Dashboard: React.FC<DashboardProps> = ({ projects, clients, cases, activities, teamMembers, currentUserId, onSelectProject, setCurrentPage, onScheduleEvent }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard configuration state with localStorage persistence
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(() => {
    const saved = localStorage.getItem('dashboardConfig');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

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
      {/* Dashboard Header with Role Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--cmf-text)' }}>Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--cmf-text-secondary)' }}>
            {getRoleDescription(dashboardConfig.role)}
          </p>
        </div>
        <DashboardRoleSelector currentRole={dashboardConfig.role} onRoleChange={handleRoleChange} />
      </div>

      <div id="dashboard-briefing">
        <DailyBriefing
          userName={currentUser?.name || 'User'}
          projects={projects}
          cases={cases}
          activities={activities}
          currentUserId={currentUserId}
        />
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
              title="Donations This Year"
              isCollapsed={isWidgetCollapsed('donations')}
              onToggle={() => toggleWidgetCollapse('donations')}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {donationSummary.loading ? (
                    <div className="h-8 w-28 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold" style={{ color: 'var(--cmf-text)' }}>
                      ${donationSummary.thisYearTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </p>
                  )}
                  <Badge variant="info" size="sm">{donationSummary.thisYearCount} gifts</Badge>
                </div>
                {!donationSummary.loading && (
                  <div className="flex gap-4 text-sm" style={{ color: 'var(--cmf-text-secondary)' }}>
                    <span>Avg: <strong>${donationSummary.averageGiftThisYear.toFixed(0)}</strong></span>
                    <span>Last yr: <strong>${donationSummary.lastYearTotal.toLocaleString()}</strong></span>
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
              <DonorRetentionWidget />
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
              <LapsedDonorAlert />
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
              <PledgeFulfillmentWidget />
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
              <DonorEngagementWidget />
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
              <ServiceImpactSummary />
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
              <HouseholdStatsWidget />
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
      </div>
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
