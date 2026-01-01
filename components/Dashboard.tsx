

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import type { Project, Client, Activity, Page, TeamMember, Case, EnrichedTask } from '../types';
import { ProjectStatus, ActivityType, ActivityStatus, TaskStatus } from '../types';
import { getDeadlineStatus } from '../src/utils/dateHelpers';
import { generateDailyBriefing } from '../src/services/geminiService';
import { Skeleton, CardSkeleton as StatCardSkeleton, ListSkeleton } from '../src/components/ui/Skeleton';
import { Sparkline } from '../src/components/charts/Sparkline';
import { ProgressRing } from '../src/components/charts/ProgressRing';


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

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  subtitle: string; 
  icon: React.ReactNode; 
  color: string; 
  id?: string;
  sparklineData?: number[];
  trend?: 'up' | 'down' | 'neutral';
}> = ({ title, value, subtitle, icon, color, id, sparklineData, trend }) => {
  const trendIcons = {
    up: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    down: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>,
    neutral: null
  };

  const trendColors = {
    up: 'text-success-600 dark:text-success-400',
    down: 'text-error-600 dark:text-error-400',
    neutral: 'text-slate-600 dark:text-slate-400'
  };

  return (
    <div 
      id={id} 
      className="bg-white/25 dark:bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/30 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
      
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{title}</p>
          <div className={`${color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            {icon}
          </div>
        </div>
        
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 mt-1 ${trendColors[trend]}`}>
                {trendIcons[trend]}
                <span className="text-xs font-semibold">{subtitle}</span>
              </div>
            )}
            {!trend && (
              <p className="text-xs text-success-700 dark:text-success-400 font-semibold uppercase tracking-wide mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-3 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkline 
              data={sparklineData} 
              color={color.includes('primary') ? '#06b6d4' : 
                     color.includes('secondary') ? '#6366f1' : 
                     color.includes('success') ? '#10b981' : 
                     '#3b82f6'}
              height={35}
              strokeWidth={2}
            />
          </div>
        )}
      </div>
    </div>
  );
};

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
        <div className="relative bg-gradient-to-br from-primary-900 via-slate-900 to-secondary-900 dark:from-slate-900 dark:via-primary-900 dark:to-slate-800 rounded-xl shadow-2xl text-white overflow-hidden hover:shadow-3xl transition-shadow duration-300">
            {/* Enhanced blur effects for more depth */}
            <div className="absolute -top-4 -right-4 w-40 h-40 bg-primary-400/20 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-secondary-500/20 rounded-full filter blur-3xl"></div>
            
            {/* Increased padding from p-6 to p-8 */}
            <div className="relative z-10 p-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold">Daily Briefing</h3>
                        <p className="text-sm text-primary-100">Your AI-powered morning summary</p>
                    </div>
                    <button 
                        onClick={getBriefing} 
                        disabled={isLoading} 
                        className="p-2 rounded-full text-primary-100 hover:bg-white/10 disabled:opacity-50 transition-all duration-200 hover:scale-110" 
                        aria-label="Refresh briefing"
                    >
                        <RefreshIcon isLoading={isLoading} />
                    </button>
                </div>
                
                {/* Added more vertical spacing */}
                <div className="mt-6 min-h-[100px]">
                    {isLoading ? (
                         <div className="space-y-3 animate-pulse">
                            <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                            <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
                            <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
                        </div>
                    ) : (
                        <p className="text-slate-100 whitespace-pre-wrap leading-relaxed">{briefing}</p>
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
        [ActivityType.Call]: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300',
        [ActivityType.Email]: 'bg-info-100 text-info-700 dark:bg-info-900/50 dark:text-info-300',
        [ActivityType.Meeting]: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/50 dark:text-secondary-300',
        [ActivityType.Note]: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    }
    if (minimal) {
        return <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white/50 text-slate-700 dark:bg-white/20 dark:text-slate-200 shadow-inner">{icons[type]}</div>;
    }
    return <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${colors[type]} shadow-sm`}>{icons[type]}</div>;
}

const TaskIcon = () => (
    <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-white/50 text-slate-600 dark:bg-white/20 dark:text-slate-200 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
        <div className="bg-white/25 dark:bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/30 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Increased padding from p-6 to p-7 */}
            <div className="p-7">
                <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Projects Nearing Deadline</h3>
                <ul className="space-y-5">
                    {nearingDeadline.length > 0 ? nearingDeadline.map(project => (
                        <li key={project.id}>
                            <button onClick={() => onSelectProject(project.id)} className="w-full text-left group">
                                <div className="flex justify-between items-center text-sm mb-1.5">
                                    <span className="font-semibold text-slate-800 group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400 truncate pr-2 transition-colors duration-200">{project.name}</span>
                                    <span className={`font-semibold ${project.deadline.color} flex-shrink-0`}>{project.deadline.text}</span>
                                </div>
                            </button>
                        </li>
                    )) : (
                        <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-12">No upcoming project deadlines.</p>
                    )}
                </ul>
            </div>
        </div>
    );
}

const DashboardSkeleton: React.FC = () => (
    <div className="space-y-10">
        <Skeleton className="h-[180px] w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white/20 dark:bg-slate-900/40 p-7 rounded-xl border border-white/20">
                    <Skeleton className="h-6 w-1/3 mb-6" />
                    <ListSkeleton items={4} />
                </div>
                <div className="bg-white/20 dark:bg-slate-900/40 p-7 rounded-xl border border-white/20">
                    <Skeleton className="h-6 w-1/3 mb-6" />
                    <ListSkeleton items={5} />
                </div>
            </div>
            <div className="bg-white/20 dark:bg-slate-900/40 p-7 rounded-xl border border-white/20">
                <Skeleton className="h-6 w-1/2 mb-6" />
                <ListSkeleton items={5} />
            </div>
        </div>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ projects, clients, cases, activities, teamMembers, currentUserId, onSelectProject, setCurrentPage, onScheduleEvent }) => {
  const [isLoading, setIsLoading] = useState(true);
  const activeProjects = projects.filter(p => p.status === ProjectStatus.InProgress).length;
  const recentActivities = activities.slice(0, 5);
  const currentUser = useMemo(() => teamMembers.find(tm => tm.id === currentUserId), [teamMembers, currentUserId]);

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

  // Generate mock sparkline data for visual insights (in a real app, this would come from your database)
  const generateSparklineData = useCallback((base: number, variance: number, points: number = 12) => {
    return Array.from({ length: points }, (_, i) => {
      const trend = i * 0.5; // Slight upward trend
      const random = (Math.random() - 0.5) * variance;
      return Math.max(0, base + trend + random);
    });
  }, []);

  // Sparkline data for each stat card (memoized for performance)
  const organizationsSparkline = useMemo(() => generateSparklineData(Math.max(1, clients.length - 5), 2), [clients.length, generateSparklineData]);
  const contactsSparkline = useMemo(() => generateSparklineData(Math.max(1, clients.length - 3), 3), [clients.length, generateSparklineData]);
  const pipelineSparkline = useMemo(() => generateSparklineData(45, 8), [generateSparklineData]);
  const projectsSparkline = useMemo(() => generateSparklineData(Math.max(1, activeProjects - 2), 1.5), [activeProjects, generateSparklineData]);

  if (isLoading) {
      return <DashboardSkeleton />;
  }

  return (
    // Increased spacing from space-y-8 to space-y-10 for better section separation + page transition animation
    <div className="space-y-10 page-transition">
      {/* Daily Briefing Section */}
      <section>
        <DailyBriefing 
          userName={currentUser?.name || 'User'}
          projects={projects}
          cases={cases}
          activities={activities}
          currentUserId={currentUserId}
        />
      </section>

      {/* Stats Section - Increased gap from gap-6 to gap-8 */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard 
            title="Organizations" 
            value={clients.length} 
            subtitle="+2 this month" 
            icon={<BuildingIcon />} 
            color="text-primary-500 dark:text-primary-400"
            sparklineData={organizationsSparkline}
            trend="up"
          />
          <StatCard 
            title="Total Contacts" 
            value={clients.length} 
            subtitle="+5 this month" 
            icon={<UsersIcon />} 
            color="text-secondary-500 dark:text-secondary-400"
            sparklineData={contactsSparkline}
            trend="up"
          />
          <StatCard 
            title="Pipeline Value" 
            value="$52K" 
            subtitle="+$8K this month" 
            icon={<DollarSignIcon />} 
            color="text-success-500 dark:text-success-400"
            sparklineData={pipelineSparkline}
            trend="up"
          />
          <StatCard 
            id="stat-card-active-projects" 
            title="Active Projects" 
            value={activeProjects} 
            subtitle={`${projects.length} total`}
            icon={<TrendingUpIcon />} 
            color="text-info-500 dark:text-info-400"
            sparklineData={projectsSparkline}
            trend="up"
          />
        </div>
      </section>

      {/* Main Content Grid - Increased gap from gap-6 to gap-8 */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Increased gap from space-y-6 to space-y-8 */}
          <div className="lg:col-span-2 space-y-8">
            <ProjectsNearingDeadline projects={projects} onSelectProject={onSelectProject} />
            
            <div className="bg-white/25 dark:bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/30 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="p-7">
                <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Recent Activities</h3>
                <ul className="space-y-5">
                  {recentActivities.map(activity => (
                      <li key={activity.id} className="flex items-center gap-4 group cursor-pointer hover:bg-white/20 dark:hover:bg-white/5 p-3 -m-3 rounded-lg transition-all duration-200">
                          <ActivityIcon type={activity.type} />
                          <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">{activity.title}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{getClientName(activity.clientId)}</p>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-500 flex-shrink-0">{formatTimeAgo(activity.activityDate)}</p>
                      </li>
                  ))}
                  {recentActivities.length === 0 && (
                    <p className="text-slate-600 dark:text-slate-400 text-center py-12">No recent activities.</p>
                  )}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Right Column - Upcoming Section */}
          <div className="bg-white/25 dark:bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/30 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="p-7 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Upcoming For You</h3>
              <ul className="space-y-5 flex-grow">
                  {upcomingItems.length > 0 ? upcomingItems.map(item => (
                      <li key={`${item.type}-${item.id}`} className="flex items-start gap-4 group cursor-pointer hover:bg-white/20 dark:hover:bg-white/5 p-3 -m-3 rounded-lg transition-all duration-200" onClick={item.onClick}>
                          <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                          <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 mb-1">{item.title}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">{item.date.toLocaleDateString()} • {item.context}</p>
                          </div>
                      </li>
                  )) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                          <p className="text-sm text-slate-600 dark:text-slate-400">Nothing upcoming on your schedule.</p>
                      </div>
                  )}
              </ul>
            </div>
          </div>
        </div>
      </section>
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
