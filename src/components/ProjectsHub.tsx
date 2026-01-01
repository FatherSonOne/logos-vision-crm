import React, { useMemo, useState } from 'react';
import type { Project, Client } from '../types';
import { ProjectStatus } from '../types';
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
  CompareIcon,
  DownloadIcon
} from './icons';

interface ProjectsHubProps {
  projects: Project[];
  clients: Client[];
  onNavigateToView: (view: 'list' | 'kanban' | 'gantt' | 'flowchart' | 'resources' | 'comparison', filter?: ProjectFilter) => void;
  onCreateProject: () => void;
  onToggleStar?: (projectId: string) => void;
  onTogglePin?: (projectId: string) => void;
  onOpenTemplates?: () => void;
  onOpenComparison?: () => void;
  onOpenExport?: () => void;
}

export interface ProjectFilter {
  type: 'status' | 'risk' | 'search' | 'quick' | 'deadline';
  value?: string;
  label?: string;
}

// Calculate project health score (0-100)
const calculateHealthScore = (project: Project): { score: number; status: 'healthy' | 'warning' | 'critical' } => {
  let score = 100;
  const now = new Date();
  const endDate = new Date(project.endDate);
  const startDate = new Date(project.startDate);
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const progress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;

  // Task completion
  const taskCompletion = project.tasks.length > 0 
    ? (project.tasks.filter(t => t.status === 'Done').length / project.tasks.length) * 100 
    : 50;
  
  // On Hold projects are critical
  if (project.status === ProjectStatus.OnHold) {
    score = 20;
  } else {
    // Behind schedule check
    if (progress > taskCompletion + 20) {
      score -= 30; // Significantly behind
    } else if (progress > taskCompletion + 10) {
      score -= 15; // Somewhat behind
    }
    
    // Overdue check
    if (project.status === ProjectStatus.InProgress && endDate < now) {
      score -= 25;
    }
    
    // Low task completion
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

export const ProjectsHub: React.FC<ProjectsHubProps> = ({
  projects,
  clients,
  onNavigateToView,
  onCreateProject,
  onToggleStar,
  onTogglePin,
  onOpenTemplates,
  onOpenComparison,
  onOpenExport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  // Calculate metrics
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

    // Calculate health scores
    const projectsWithHealth = projects.map(p => ({
      ...p,
      health: calculateHealthScore(p)
    }));

    const healthyCount = projectsWithHealth.filter(p => p.health.status === 'healthy').length;
    const warningCount = projectsWithHealth.filter(p => p.health.status === 'warning').length;
    const criticalCount = projectsWithHealth.filter(p => p.health.status === 'critical').length;

    // Recent projects (last 5, prioritize pinned)
    const pinnedProjects = projects.filter(p => p.pinned);
    const unpinnedRecent = projects
      .filter(p => !p.pinned)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, Math.max(0, 5 - pinnedProjects.length));
    const recent = [...pinnedProjects, ...unpinnedRecent].slice(0, 5);

    // Starred projects
    const starred = projects.filter(p => p.starred);

    // At-risk projects
    const now = new Date();
    const atRisk = projectsWithHealth.filter(p => 
      p.health.status === 'critical' || p.health.status === 'warning'
    );

    // Upcoming deadlines (next 7 days)
    const upcomingDeadlines = projects
      .filter(p => {
        const endDate = new Date(p.endDate);
        const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil >= 0 && daysUntil <= 7 && p.status !== ProjectStatus.Completed;
      })
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      .slice(0, 5);

    // Behind schedule projects
    const behindSchedule = projectsWithHealth.filter(p => {
      const endDate = new Date(p.endDate);
      const taskCompletion = p.tasks.length > 0 
        ? (p.tasks.filter(t => t.status === 'Done').length / p.tasks.length) * 100 
        : 0;
      return p.status === ProjectStatus.InProgress && taskCompletion < 50 && endDate < now;
    });

    return {
      total,
      active,
      planning,
      completed,
      onHold,
      completionRate,
      recent,
      starred,
      pinned: pinnedProjects,
      atRisk: atRisk.length,
      atRiskProjects: atRisk,
      healthyCount,
      warningCount,
      criticalCount,
      upcomingDeadlines,
      behindSchedule
    };
  }, [projects]);

  // AI Insights
  const aiInsights = useMemo(() => {
    const insights: { icon: React.ReactNode; text: string; action: () => void; type: 'warning' | 'success' | 'info' }[] = [];

    if (metrics.behindSchedule.length > 0) {
      insights.push({
        icon: <AlertCircleIcon className="h-5 w-5" />,
        text: `${metrics.behindSchedule.length} project${metrics.behindSchedule.length > 1 ? 's are' : ' is'} behind schedule`,
        action: () => onNavigateToView('list', { type: 'quick', value: 'behind', label: 'Behind Schedule' }),
        type: 'warning'
      });
    }

    if (metrics.upcomingDeadlines.length > 0) {
      insights.push({
        icon: <ClockIcon />,
        text: `${metrics.upcomingDeadlines.length} deadline${metrics.upcomingDeadlines.length > 1 ? 's' : ''} coming up this week`,
        action: () => onNavigateToView('list', { type: 'deadline', label: 'Upcoming Deadlines' }),
        type: 'info'
      });
    }

    if (metrics.completionRate >= 80) {
      insights.push({
        icon: <TrendingUpIcon />,
        text: `Great progress! ${metrics.completionRate}% of tasks completed`,
        action: () => onNavigateToView('list'),
        type: 'success'
      });
    }

    if (metrics.onHold > 0) {
      insights.push({
        icon: <AlertCircleIcon className="h-5 w-5" />,
        text: `${metrics.onHold} project${metrics.onHold > 1 ? 's are' : ' is'} on hold - review status`,
        action: () => onNavigateToView('list', { type: 'status', value: ProjectStatus.OnHold, label: 'On Hold' }),
        type: 'warning'
      });
    }

    return insights.slice(0, 3); // Show top 3 insights
  }, [metrics, onNavigateToView]);

  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtitle?: string;
    color: string;
    gradient: string;
    onClick?: () => void;
  }> = ({ icon, label, value, subtitle, color, gradient, onClick }) => (
    <button
      onClick={onClick}
      className={`${gradient} p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left w-full ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</div>
      {subtitle && (
        <div className="text-xs text-slate-600 dark:text-slate-400">{subtitle}</div>
      )}
      {onClick && (
        <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-2 font-semibold">Click to filter →</div>
      )}
    </button>
  );

  const QuickActionCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    onClick: () => void;
  }> = ({ icon, title, description, color, onClick }) => (
    <button
      onClick={onClick}
      className={`${color} p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left w-full group`}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-200">{description}</p>
    </button>
  );

  const ViewNavigationCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    view: 'list' | 'kanban' | 'gantt' | 'flowchart' | 'resources';
    color: string;
  }> = ({ icon, title, description, view, color }) => (
    <button
      onClick={() => onNavigateToView(view)}
      className={`${color} p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left w-full group`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-colors">
          {icon}
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <p className="text-xs text-slate-700 dark:text-slate-200">{description}</p>
    </button>
  );

  const HealthBadge: React.FC<{ status: 'healthy' | 'warning' | 'critical' }> = ({ status }) => {
    const config = {
      healthy: { color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', label: '🟢 Healthy' },
      warning: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300', label: '🟡 Warning' },
      critical: { color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', label: '🔴 Critical' }
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config[status].color}`}>
        {config[status].label}
      </span>
    );
  };

  const handleQuickFilter = (filter: string) => {
    setActiveQuickFilter(filter === activeQuickFilter ? null : filter);
    const filterMap: Record<string, ProjectFilter> = {
      'my-projects': { type: 'quick', value: 'my', label: 'My Projects' },
      'urgent': { type: 'quick', value: 'urgent', label: 'Urgent' },
      'this-week': { type: 'quick', value: 'week', label: 'This Week' }
    };
    onNavigateToView('list', filterMap[filter]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Projects Command Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your complete project management powerhouse
          </p>
        </div>
        <button
          onClick={onCreateProject}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
        >
          <PlusIcon size="sm" />
          New Project
        </button>
      </div>

      {/* Search & Quick Filters */}
      <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-xl border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  onNavigateToView('list', { type: 'search', value: searchQuery, label: `Search: ${searchQuery}` });
                }
              }}
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleQuickFilter('my-projects')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeQuickFilter === 'my-projects'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-white/70'
              }`}
            >
              My Projects
            </button>
            <button
              onClick={() => handleQuickFilter('urgent')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeQuickFilter === 'urgent'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-white/70'
              }`}
            >
              Urgent
            </button>
            <button
              onClick={() => handleQuickFilter('this-week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeQuickFilter === 'this-week'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-white/70'
              }`}
            >
              This Week
            </button>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      {aiInsights.length > 0 && (
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-xl p-6 rounded-xl border border-purple-200/30 dark:border-purple-700/30">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Insights</h2>
          </div>
          <div className="space-y-3">
            {aiInsights.map((insight, idx) => (
              <button
                key={idx}
                onClick={insight.action}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all hover:scale-[1.02] ${
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
                <span className="flex-1 text-left font-medium text-slate-900 dark:text-slate-100">{insight.text}</span>
                <span className="text-sm text-cyan-600 dark:text-cyan-400 font-semibold">View →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics - Now Clickable! */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FolderIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          label="Total Projects"
          value={metrics.total}
          subtitle="All projects"
          color="text-blue-600"
          gradient="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20"
          onClick={() => onNavigateToView('list')}
        />
        <StatCard
          icon={<ZapIcon className="h-6 w-6 text-green-600 dark:text-green-400" />}
          label="Active Projects"
          value={metrics.active}
          subtitle={`${metrics.planning} in planning`}
          color="text-green-600"
          gradient="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/20"
          onClick={() => onNavigateToView('list', { type: 'status', value: ProjectStatus.InProgress, label: 'Active' })}
        />
        <StatCard
          icon={<CheckCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
          label="Completed"
          value={metrics.completed}
          subtitle={`${metrics.completionRate}% tasks done`}
          color="text-purple-600"
          gradient="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20"
          onClick={() => onNavigateToView('list', { type: 'status', value: ProjectStatus.Completed, label: 'Completed' })}
        />
        <StatCard
          icon={<AlertCircleIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />}
          label="At Risk"
          value={metrics.atRisk}
          subtitle={`${metrics.onHold} on hold`}
          color="text-orange-600"
          gradient="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20"
          onClick={() => onNavigateToView('list', { type: 'risk', label: 'At Risk' })}
        />
      </div>

      {/* Pinned Projects */}
      {metrics.pinned.length > 0 && (
        <div className="bg-gradient-to-br from-amber-100/50 to-yellow-100/50 dark:from-amber-900/20 dark:to-yellow-900/20 backdrop-blur-xl p-6 rounded-xl border border-amber-200/50 dark:border-amber-700/30">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <StarIcon className="h-6 w-6 text-amber-500" filled={true} />
            Pinned Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.pinned.map(project => {
              const client = clients.find(c => c.id === project.clientId);
              const health = calculateHealthScore(project);
              const progress = project.tasks.length > 0
                ? Math.round((project.tasks.filter(t => t.status === 'Done').length / project.tasks.length) * 100)
                : 0;
              
              return (
                <div
                  key={project.id}
                  className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-lg border border-white/40 hover:border-amber-300 dark:hover:border-amber-600 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-lg group relative"
                >
                  {/* Pin button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin?.(project.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 dark:bg-slate-700/80 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                  >
                    <StarIcon className="h-4 w-4 text-amber-500" filled={true} />
                  </button>

                  <div className="mb-3">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 pr-8">{project.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{client?.name || 'Unknown Client'}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <HealthBadge status={health.status} />
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {project.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Progress</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {project.tasks.filter(t => t.status === 'Done').length}/{project.tasks.length} tasks • Due {new Date(project.endDate).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Deadlines Widget */}
      {metrics.upcomingDeadlines.length > 0 && (
        <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-xl border border-white/20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ClockIcon />
            Upcoming Deadlines
          </h2>
          <div className="space-y-3">
            {metrics.upcomingDeadlines.map(project => {
              const client = clients.find(c => c.id === project.clientId);
              const daysUntil = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const health = calculateHealthScore(project);
              
              return (
                <div
                  key={project.id}
                  className="bg-white/30 dark:bg-slate-800/30 p-4 rounded-lg border border-white/20 hover:border-white/40 transition-all cursor-pointer hover:scale-[1.01]"
                  onClick={() => onNavigateToView('list')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{project.name}</h3>
                    <HealthBadge status={health.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{client?.name || 'Unknown Client'}</span>
                    <span className={`font-bold ${
                      daysUntil === 0 ? 'text-red-600 dark:text-red-400' :
                      daysUntil <= 2 ? 'text-orange-600 dark:text-orange-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {daysUntil === 0 ? 'Due Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <QuickActionCard
            icon={<PlusIcon className="h-6 w-6 text-white" />}
            title="Start New Project"
            description="Launch a project with AI planning assistant"
            color="bg-gradient-to-br from-cyan-500 to-blue-600"
            onClick={onCreateProject}
          />
          <QuickActionCard
            icon={<FileTextIcon className="h-6 w-6 text-white" />}
            title="Use Template"
            description="Quick start with pre-built templates"
            color="bg-gradient-to-br from-purple-500 to-pink-600"
            onClick={onOpenTemplates || (() => alert('Templates coming soon!'))}
          />
          <QuickActionCard
            icon={<CompareIcon className="h-6 w-6 text-white" />}
            title="Compare Projects"
            description="Side-by-side project comparison"
            color="bg-gradient-to-br from-indigo-500 to-purple-600"
            onClick={onOpenComparison || (() => onNavigateToView('comparison'))}
          />
          <QuickActionCard
            icon={<DownloadIcon className="h-6 w-6 text-white" />}
            title="Export & Reports"
            description="Generate reports and export data"
            color="bg-gradient-to-br from-emerald-500 to-green-600"
            onClick={onOpenExport || (() => alert('Export coming soon!'))}
          />
          <QuickActionCard
            icon={<TrendingUpIcon className="h-6 w-6 text-white" />}
            title="View Analytics"
            description="Dive into project performance data"
            color="bg-gradient-to-br from-green-500 to-teal-600"
            onClick={() => alert('Analytics coming soon!')}
          />
        </div>
      </div>

      {/* View Navigation */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Project Views</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ViewNavigationCard
            icon={<LayoutIcon className="h-5 w-5 text-white" />}
            title="List View"
            description="Cards & timeline view"
            view="list"
            color="bg-gradient-to-br from-blue-400 to-blue-500 dark:from-blue-600 dark:to-blue-700"
          />
          <ViewNavigationCard
            icon={<TargetIcon className="h-5 w-5 text-white" />}
            title="Kanban Board"
            description="Drag & drop tasks"
            view="kanban"
            color="bg-gradient-to-br from-purple-400 to-purple-500 dark:from-purple-600 dark:to-purple-700"
          />
          <ViewNavigationCard
            icon={<BarChartIcon className="h-5 w-5 text-white" />}
            title="Gantt Chart"
            description="Timeline scheduling"
            view="gantt"
            color="bg-gradient-to-br from-green-400 to-green-500 dark:from-green-600 dark:to-green-700"
          />
          <ViewNavigationCard
            icon={<GitBranchIcon className="h-5 w-5 text-white" />}
            title="Flowchart"
            description="Visual workflows"
            view="flowchart"
            color="bg-gradient-to-br from-orange-400 to-orange-500 dark:from-orange-600 dark:to-orange-700"
          />
          <ViewNavigationCard
            icon={<UsersIcon className="h-5 w-5 text-white" />}
            title="Resources"
            description="Team & budget"
            view="resources"
            color="bg-gradient-to-br from-pink-400 to-pink-500 dark:from-pink-600 dark:to-pink-700"
          />
        </div>
      </div>

      {/* Recent Projects with Health Scores */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {metrics.pinned.length > 0 ? 'Pinned & Recent Projects' : 'Recent Projects'}
        </h2>
        <div className="space-y-3">
          {metrics.recent.map(project => {
            const client = clients.find(c => c.id === project.clientId);
            const health = calculateHealthScore(project);
            return (
              <div
                key={project.id}
                className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-4 rounded-lg border border-white/20 hover:border-white/40 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => onNavigateToView('list')}>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{project.name}</h3>
                      {project.pinned && (
                        <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 text-xs font-semibold rounded">
                          PINNED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{client?.name || 'Unknown Client'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Star/Pin buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onToggleStar && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(project.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            project.starred
                              ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-100/50 dark:bg-yellow-900/30'
                              : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-100/50'
                          }`}
                          title={project.starred ? 'Unstar' : 'Star'}
                        >
                          <StarIcon className="h-4 w-4" filled={project.starred} />
                        </button>
                      )}
                      {onTogglePin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(project.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            project.pinned
                              ? 'text-cyan-500 hover:text-cyan-600 bg-cyan-100/50 dark:bg-cyan-900/30'
                              : 'text-slate-400 hover:text-cyan-500 hover:bg-cyan-100/50'
                          }`}
                          title={project.pinned ? 'Unpin' : 'Pin to top'}
                        >
                          📌
                        </button>
                      )}
                    </div>
                    <HealthBadge status={health.status} />
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === ProjectStatus.InProgress ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                      project.status === ProjectStatus.Planning ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                      project.status === ProjectStatus.Completed ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
                    }`}>
                      {project.status}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <ClockIcon />
                      {new Date(project.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {metrics.recent.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No projects yet. Create your first project to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
