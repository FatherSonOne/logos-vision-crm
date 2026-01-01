import React, { useState, useMemo, useCallback } from 'react';
import type { Project, Client, TeamMember, Task, Activity } from '../types';
import { ProjectStatus, TaskStatus } from '../types';
import {
  FolderIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  UsersIcon,
  TargetIcon,
  ZapIcon,
  FileTextIcon,
  LayoutIcon,
  GitBranchIcon,
  BarChartIcon,
  SearchIcon,
  SparklesIcon,
  StarIcon,
  DollarSignIcon,
  CalendarIcon,
  FilterIcon,
  ChevronRightIcon
} from './icons';

// Import sub-views
import { ProjectKanbanEnhanced } from './ProjectKanbanEnhanced';
import { ProjectTimelineEnhanced } from './ProjectTimelineEnhanced';
import { ProjectList } from './ProjectList';
import { NewProjectDialog } from './NewProjectDialog';
import { ProjectPlannerModal } from './ProjectPlannerModal';
import { ProjectCalendar } from './projects/ProjectCalendar';

interface ProjectsCommandCenterProps {
  projects: Project[];
  clients: Client[];
  teamMembers: TeamMember[];
  activities: Activity[];
  onSelectProject: (id: string) => void;
  onCreateProject: (project: Partial<Project>) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject?: (id: string) => void;
}

type ViewMode = 'dashboard' | 'list' | 'kanban' | 'timeline' | 'calendar';

// Quick filter labels for display
const QUICK_FILTER_LABELS: Record<string, string> = {
  pinned: '⭐ Pinned Projects',
  urgent: '🔴 Urgent Projects',
  thisweek: '📅 This Week',
  atrisk: '⚠️ At Risk Projects',
  critical: '🚨 Critical Projects',
  deadlines: '⏰ Upcoming Deadlines',
  onhold: '⏸️ On Hold'
};

// Calculate project health score (0-100)
const calculateHealthScore = (project: Project): { score: number; status: 'healthy' | 'warning' | 'critical' } => {
  let score = 100;
  const now = new Date();
  const endDate = new Date(project.endDate);
  const startDate = new Date(project.startDate);
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const progress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;

  const taskCompletion = project.tasks.length > 0
    ? (project.tasks.filter(t => t.status === 'Done').length / project.tasks.length) * 100
    : 50;

  if (project.status === ProjectStatus.OnHold) {
    score = 20;
  } else {
    if (progress > taskCompletion + 20) {
      score -= 30;
    } else if (progress > taskCompletion + 10) {
      score -= 15;
    }

    if (project.status === ProjectStatus.InProgress && endDate < now) {
      score -= 25;
    }

    if (taskCompletion < 30 && progress > 50) {
      score -= 20;
    }
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    status: score >= 70 ? 'healthy' : score >= 40 ? 'warning' : 'critical'
  };
};

export const ProjectsCommandCenter: React.FC<ProjectsCommandCenterProps> = ({
  projects,
  clients,
  teamMembers,
  activities,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}) => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === ProjectStatus.InProgress).length;
    const planning = projects.filter(p => p.status === ProjectStatus.Planning).length;
    const completed = projects.filter(p => p.status === ProjectStatus.Completed).length;
    const onHold = projects.filter(p => p.status === ProjectStatus.OnHold).length;

    const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = projects.reduce((sum, p) =>
      sum + p.tasks.filter(t => t.status === 'Done').length, 0
    );
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Budget calculations
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const avgBudget = total > 0 ? totalBudget / total : 0;

    // Health calculations
    const projectsWithHealth = projects.map(p => ({
      ...p,
      health: calculateHealthScore(p)
    }));

    const healthyCount = projectsWithHealth.filter(p => p.health.status === 'healthy').length;
    const warningCount = projectsWithHealth.filter(p => p.health.status === 'warning').length;
    const criticalCount = projectsWithHealth.filter(p => p.health.status === 'critical').length;

    // Pinned and starred
    const pinnedProjects = projects.filter(p => p.pinned);
    const starredProjects = projects.filter(p => p.starred);

    // Upcoming deadlines (next 7 days)
    const now = new Date();
    const upcomingDeadlines = projects
      .filter(p => {
        const endDate = new Date(p.endDate);
        const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil >= 0 && daysUntil <= 7 && p.status !== ProjectStatus.Completed;
      })
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      .slice(0, 5);

    // At risk projects
    const atRiskProjects = projectsWithHealth.filter(p =>
      p.health.status === 'critical' || p.health.status === 'warning'
    );

    // Recent projects (by updated or created date)
    const recentProjects = [...projects]
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || a.startDate);
        const dateB = new Date(b.updatedAt || b.createdAt || b.startDate);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    return {
      total,
      active,
      planning,
      completed,
      onHold,
      completionRate,
      totalBudget,
      avgBudget,
      totalTasks,
      completedTasks,
      healthyCount,
      warningCount,
      criticalCount,
      pinnedProjects,
      starredProjects,
      upcomingDeadlines,
      atRiskProjects,
      recentProjects,
      projectsWithHealth
    };
  }, [projects]);

  // AI Insights
  const aiInsights = useMemo(() => {
    const insights: { icon: React.ReactNode; text: string; action: () => void; type: 'warning' | 'success' | 'info' }[] = [];

    if (metrics.criticalCount > 0) {
      insights.push({
        icon: <AlertCircleIcon className="h-5 w-5" />,
        text: `${metrics.criticalCount} project${metrics.criticalCount > 1 ? 's need' : ' needs'} immediate attention`,
        action: () => setActiveQuickFilter('critical'),
        type: 'warning'
      });
    }

    if (metrics.upcomingDeadlines.length > 0) {
      insights.push({
        icon: <ClockIcon />,
        text: `${metrics.upcomingDeadlines.length} deadline${metrics.upcomingDeadlines.length > 1 ? 's' : ''} coming up this week`,
        action: () => setActiveQuickFilter('deadlines'),
        type: 'info'
      });
    }

    if (metrics.completionRate >= 80) {
      insights.push({
        icon: <TrendingUpIcon />,
        text: `Great progress! ${metrics.completionRate}% of tasks completed`,
        action: () => setCurrentView('list'),
        type: 'success'
      });
    }

    if (metrics.onHold > 0) {
      insights.push({
        icon: <AlertCircleIcon className="h-5 w-5" />,
        text: `${metrics.onHold} project${metrics.onHold > 1 ? 's are' : ' is'} on hold - review status`,
        action: () => setActiveQuickFilter('onhold'),
        type: 'warning'
      });
    }

    return insights.slice(0, 3);
  }, [metrics]);

  // Handle project creation from AI planner
  const handleAiPlannerSave = useCallback((plan: any, clientId: string) => {
    const tasks: Task[] = plan.phases.flatMap((phase: any, phaseIndex: number) =>
      phase.tasks.map((taskDesc: string, taskIndex: number) => ({
        id: `task-${Date.now()}-${phaseIndex}-${taskIndex}`,
        description: taskDesc,
        phase: phase.phaseName,
        teamMemberId: '',
        dueDate: '',
        status: TaskStatus.ToDo
      }))
    );

    const newProject: Partial<Project> = {
      id: `project-${Date.now()}`,
      name: plan.projectName,
      description: plan.description,
      clientId,
      teamMemberIds: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: ProjectStatus.Planning,
      tasks,
      pinned: false,
      starred: false,
      tags: []
    };

    onCreateProject(newProject);
    setIsAiPlannerOpen(false);
  }, [onCreateProject]);

  // Handle status update from Kanban
  const handleUpdateProjectStatus = useCallback((projectId: string, newStatus: ProjectStatus) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onUpdateProject({ ...project, status: newStatus });
    }
  }, [projects, onUpdateProject]);

  // Stat Card Component
  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtitle?: string;
    color: string;
    gradient: string;
    onClick?: () => void;
  }> = ({ icon, label, value, subtitle, gradient, onClick }) => (
    <button
      onClick={onClick}
      className={`${gradient} p-5 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left w-full ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="p-2.5 rounded-lg bg-white/20">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">{value}</div>
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</div>
      {subtitle && (
        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{subtitle}</div>
      )}
    </button>
  );

  // View Navigation Card
  const ViewCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    view: ViewMode;
    color: string;
    isActive: boolean;
  }> = ({ icon, title, description, view, color, isActive }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`${color} p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 text-left w-full group ${
        isActive ? 'border-white ring-2 ring-white/50' : 'border-transparent hover:border-white/50'
      }`}
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
          {icon}
        </div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <p className="text-xs text-white/80">{description}</p>
    </button>
  );

  // Health Badge Component
  const HealthBadge: React.FC<{ status: 'healthy' | 'warning' | 'critical' }> = ({ status }) => {
    const config = {
      healthy: { color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', icon: '●' },
      warning: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300', icon: '●' },
      critical: { color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', icon: '●' }
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config[status].color} flex items-center gap-1`}>
        <span className={status === 'healthy' ? 'text-green-500' : status === 'warning' ? 'text-yellow-500' : 'text-red-500'}>
          {config[status].icon}
        </span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Render Dashboard View
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* AI Insights Panel */}
      {aiInsights.length > 0 && (
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-xl p-5 rounded-xl border border-purple-200/30 dark:border-purple-700/30">
          <div className="flex items-center gap-2 mb-3">
            <SparklesIcon />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">AI Insights</h2>
          </div>
          <div className="space-y-2">
            {aiInsights.map((insight, idx) => (
              <button
                key={idx}
                onClick={insight.action}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.01] ${
                  insight.type === 'warning' ? 'bg-orange-100/50 dark:bg-orange-900/20 hover:bg-orange-200/50' :
                  insight.type === 'success' ? 'bg-green-100/50 dark:bg-green-900/20 hover:bg-green-200/50' :
                  'bg-blue-100/50 dark:bg-blue-900/20 hover:bg-blue-200/50'
                }`}
              >
                <div className={`${
                  insight.type === 'warning' ? 'text-orange-600 dark:text-orange-400' :
                  insight.type === 'success' ? 'text-green-600 dark:text-green-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  {insight.icon}
                </div>
                <span className="flex-1 text-left text-sm font-medium text-slate-900 dark:text-slate-100">{insight.text}</span>
                <ChevronRightIcon className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FolderIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          label="Total Projects"
          value={metrics.total}
          subtitle={`${metrics.healthyCount} healthy`}
          color="text-blue-600"
          gradient="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20"
          onClick={() => setCurrentView('list')}
        />
        <StatCard
          icon={<ZapIcon className="h-5 w-5 text-green-600 dark:text-green-400" />}
          label="Active"
          value={metrics.active}
          subtitle={`${metrics.planning} in planning`}
          color="text-green-600"
          gradient="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/20"
          onClick={() => setCurrentView('kanban')}
        />
        <StatCard
          icon={<DollarSignIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          label="Total Budget"
          value={`$${metrics.totalBudget.toLocaleString()}`}
          subtitle={`Avg: $${Math.round(metrics.avgBudget).toLocaleString()}`}
          color="text-purple-600"
          gradient="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20"
        />
        <StatCard
          icon={<AlertCircleIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
          label="At Risk"
          value={metrics.atRiskProjects.length}
          subtitle={`${metrics.onHold} on hold`}
          color="text-orange-600"
          gradient="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20"
          onClick={() => setActiveQuickFilter('atrisk')}
        />
      </div>

      {/* View Navigation */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">Project Views</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <ViewCard
            icon={<LayoutIcon className="h-4 w-4 text-white" />}
            title="List View"
            description="Cards & details"
            view="list"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            isActive={currentView === 'list'}
          />
          <ViewCard
            icon={<TargetIcon className="h-4 w-4 text-white" />}
            title="Kanban"
            description="Drag & drop workflow"
            view="kanban"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            isActive={currentView === 'kanban'}
          />
          <ViewCard
            icon={<BarChartIcon className="h-4 w-4 text-white" />}
            title="Timeline"
            description="Gantt scheduling"
            view="timeline"
            color="bg-gradient-to-br from-green-500 to-green-600"
            isActive={currentView === 'timeline'}
          />
          <ViewCard
            icon={<CalendarIcon className="h-4 w-4 text-white" />}
            title="Calendar"
            description="Date overview"
            view="calendar"
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            isActive={currentView === 'calendar'}
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pinned Projects */}
        {metrics.pinnedProjects.length > 0 && (
          <div className="bg-gradient-to-br from-amber-100/50 to-yellow-100/50 dark:from-amber-900/20 dark:to-yellow-900/20 backdrop-blur-xl p-5 rounded-xl border border-amber-200/50 dark:border-amber-700/30">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-amber-500" filled={true} />
              Pinned Projects
            </h2>
            <div className="space-y-2">
              {metrics.pinnedProjects.slice(0, 4).map(project => {
                const client = clients.find(c => c.id === project.clientId);
                const health = calculateHealthScore(project);
                const progress = project.tasks.length > 0
                  ? Math.round((project.tasks.filter(t => t.status === 'Done').length / project.tasks.length) * 100)
                  : 0;

                return (
                  <button
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="w-full text-left bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg border border-white/40 hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01] group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{project.name}</h3>
                      <HealthBadge status={health.status} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{client?.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{progress}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        {metrics.upcomingDeadlines.length > 0 && (
          <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-5 rounded-xl border border-white/20">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <ClockIcon />
              Upcoming Deadlines
            </h2>
            <div className="space-y-2">
              {metrics.upcomingDeadlines.map(project => {
                const client = clients.find(c => c.id === project.clientId);
                const daysUntil = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const health = calculateHealthScore(project);

                return (
                  <button
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="w-full text-left bg-white/30 dark:bg-slate-800/30 p-3 rounded-lg border border-white/20 hover:border-white/40 transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.01] group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{project.name}</h3>
                      <span className={`text-xs font-bold ${
                        daysUntil === 0 ? 'text-red-600 dark:text-red-400' :
                        daysUntil <= 2 ? 'text-orange-600 dark:text-orange-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                        {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">{client?.name}</span>
                      <HealthBadge status={health.status} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent Projects */}
      <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-5 rounded-xl border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Projects</h2>
          <button
            onClick={() => setCurrentView('list')}
            className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            View all <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {metrics.recentProjects.map(project => {
            const client = clients.find(c => c.id === project.clientId);
            const health = calculateHealthScore(project);
            const progress = project.tasks.length > 0
              ? Math.round((project.tasks.filter(t => t.status === 'Done').length / project.tasks.length) * 100)
              : 0;

            return (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="w-full flex items-center gap-4 p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md text-left group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{project.name}</h3>
                    {project.pinned && <StarIcon className="h-3 w-3 text-amber-500" filled />}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{client?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <HealthBadge status={health.status} />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === ProjectStatus.InProgress ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                    project.status === ProjectStatus.Planning ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                    project.status === ProjectStatus.Completed ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {currentView === 'dashboard' ? 'Projects Command Center' :
             currentView === 'kanban' ? 'Kanban Board' :
             currentView === 'timeline' ? 'Project Timeline' :
             currentView === 'calendar' ? 'Project Calendar' : 'Projects'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {currentView === 'dashboard' ? 'Your complete project management hub' :
             currentView === 'kanban' ? 'Drag and drop to update project status' :
             currentView === 'timeline' ? 'Visualize project schedules and milestones' :
             currentView === 'calendar' ? 'View projects by date' : 'Manage all your projects'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentView !== 'dashboard' && (
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all border border-white/20"
            >
              <LayoutIcon className="h-4 w-4" />
              Command Center
            </button>
          )}
          <button
            onClick={() => setIsNewProjectDialogOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            <PlusIcon size="sm" />
            New Project
          </button>
        </div>
      </div>

      {/* Quick Search (always visible) */}
      {currentView === 'dashboard' && (
        <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-4 rounded-xl border border-white/20">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setCurrentView('list');
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setActiveQuickFilter('pinned'); setCurrentView('list'); }}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeQuickFilter === 'pinned'
                    ? 'bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200 ring-2 ring-amber-400 dark:ring-amber-600'
                    : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                }`}
              >
                <StarIcon className="h-4 w-4" filled />
                Pinned
              </button>
              <button
                onClick={() => { setActiveQuickFilter('urgent'); setCurrentView('list'); }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeQuickFilter === 'urgent'
                    ? 'bg-orange-200 dark:bg-orange-800/60 text-orange-800 dark:text-orange-200 ring-2 ring-orange-400 dark:ring-orange-600'
                    : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                }`}
              >
                Urgent
              </button>
              <button
                onClick={() => { setActiveQuickFilter('thisweek'); setCurrentView('list'); }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeQuickFilter === 'thisweek'
                    ? 'bg-purple-200 dark:bg-purple-800/60 text-purple-800 dark:text-purple-200 ring-2 ring-purple-400 dark:ring-purple-600'
                    : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                }`}
              >
                This Week
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {currentView === 'dashboard' && renderDashboard()}

      {currentView === 'list' && (
        <>
          {/* Filter Context Banner */}
          {activeQuickFilter && (
            <div className="mb-4 flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-900/30 dark:to-blue-900/30 px-4 py-3 rounded-xl border border-cyan-200/50 dark:border-cyan-700/30">
              <div className="flex items-center gap-3">
                <span className="text-cyan-700 dark:text-cyan-300 font-semibold">
                  {QUICK_FILTER_LABELS[activeQuickFilter] || activeQuickFilter}
                </span>
                <span className="text-sm text-cyan-600/70 dark:text-cyan-400/70">
                  ({projects.length} projects)
                </span>
              </div>
              <button
                onClick={() => setActiveQuickFilter(null)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 rounded-lg transition-colors"
              >
                <span>✕</span>
                Clear Filter
              </button>
            </div>
          )}
          <ProjectList
            projects={projects}
            clients={clients}
            teamMembers={teamMembers}
            onSelectProject={onSelectProject}
            onAddProject={() => setIsNewProjectDialogOpen(true)}
            onEditProject={(id) => onSelectProject(id)}
            onDeleteProject={onDeleteProject}
            onUpdateProject={onUpdateProject}
            onBackToHub={() => {
              setActiveQuickFilter(null);
              setCurrentView('dashboard');
            }}
            filterLabel={activeQuickFilter ? QUICK_FILTER_LABELS[activeQuickFilter] : undefined}
          />
        </>
      )}

      {currentView === 'kanban' && (
        <ProjectKanbanEnhanced
          projects={projects}
          clients={clients}
          onSelectProject={onSelectProject}
          onUpdateProjectStatus={handleUpdateProjectStatus}
          onBackToHub={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'timeline' && (
        <ProjectTimelineEnhanced
          projects={projects}
          clients={clients}
          onSelectProject={onSelectProject}
          onBackToHub={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'calendar' && (
        <div className="h-[calc(100vh-200px)] min-h-[600px]">
          <ProjectCalendar
            projects={projects}
            clients={clients}
            onSelectProject={onSelectProject}
            onSelectTask={(task, projectId) => {
              // Navigate to the project when a task is selected
              onSelectProject(projectId);
            }}
          />
        </div>
      )}

      {/* Dialogs */}
      <NewProjectDialog
        isOpen={isNewProjectDialogOpen}
        onClose={() => setIsNewProjectDialogOpen(false)}
        onCreateProject={onCreateProject}
        onOpenAiPlanner={() => {
          setIsNewProjectDialogOpen(false);
          setIsAiPlannerOpen(true);
        }}
        clients={clients}
        teamMembers={teamMembers}
      />

      <ProjectPlannerModal
        isOpen={isAiPlannerOpen}
        onClose={() => setIsAiPlannerOpen(false)}
        onSave={handleAiPlannerSave}
        clients={clients}
      />
    </div>
  );
};
