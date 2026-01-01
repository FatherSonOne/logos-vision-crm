import React, { useState, useMemo } from 'react';
import type { Project, Client } from '../types';
import { ProjectStatus } from '../types';
import {
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  BriefcaseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FilterIcon,
  SettingsIcon,
  StarIcon,
  DollarSignIcon
} from './icons';

interface ProjectKanbanEnhancedProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (id: string) => void;
  onUpdateProjectStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onBackToHub?: () => void;
}

interface KanbanColumn {
  id: ProjectStatus;
  title: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  wipLimit?: number;
}

type SwimlaneType = 'none' | 'client' | 'priority' | 'health';

const defaultColumns: KanbanColumn[] = [
  {
    id: ProjectStatus.Planning,
    title: 'Planning',
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: <BriefcaseIcon className="h-4 w-4" />,
    wipLimit: 5
  },
  {
    id: ProjectStatus.InProgress,
    title: 'In Progress',
    color: 'from-green-400 to-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: <AlertCircleIcon className="h-4 w-4" />,
    wipLimit: 3
  },
  {
    id: ProjectStatus.OnHold,
    title: 'On Hold',
    color: 'from-orange-400 to-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    icon: <ClockIcon />,
    wipLimit: 2
  },
  {
    id: ProjectStatus.Completed,
    title: 'Completed',
    color: 'from-purple-400 to-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    icon: <CheckCircleIcon className="h-4 w-4" />
  }
];

// Calculate urgency based on deadline
const getUrgencyLevel = (project: Project): 'overdue' | 'urgent' | 'soon' | 'normal' => {
  if (project.status === ProjectStatus.Completed) return 'normal';

  const now = new Date();
  const endDate = new Date(project.endDate);
  const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 2) return 'urgent';
  if (daysUntil <= 7) return 'soon';
  return 'normal';
};

// Calculate health score
const getHealthStatus = (project: Project): 'healthy' | 'warning' | 'critical' => {
  const now = new Date();
  const endDate = new Date(project.endDate);
  const startDate = new Date(project.startDate);
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const timeProgress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;

  const taskCompletion = project.tasks.length > 0
    ? (project.tasks.filter(t => t.status === 'Done').length / project.tasks.length) * 100
    : 50;

  if (project.status === ProjectStatus.OnHold) return 'critical';
  if (timeProgress > taskCompletion + 20) return 'critical';
  if (timeProgress > taskCompletion + 10) return 'warning';
  return 'healthy';
};

export const ProjectKanbanEnhanced: React.FC<ProjectKanbanEnhancedProps> = ({
  projects,
  clients,
  onSelectProject,
  onUpdateProjectStatus,
  onBackToHub
}) => {
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ProjectStatus | null>(null);
  const [swimlaneType, setSwimlaneType] = useState<SwimlaneType>('none');
  const [showSettings, setShowSettings] = useState(false);
  const [wipLimits, setWipLimits] = useState<Record<ProjectStatus, number>>({
    [ProjectStatus.Planning]: 5,
    [ProjectStatus.InProgress]: 3,
    [ProjectStatus.OnHold]: 2,
    [ProjectStatus.Completed]: 999,
    [ProjectStatus.Active]: 999,
    [ProjectStatus.Cancelled]: 999
  });
  const [collapsedSwimlanes, setCollapsedSwimlanes] = useState<Set<string>>(new Set());

  // Group projects by status
  const projectsByStatus = useMemo(() => {
    const grouped: Record<ProjectStatus, Project[]> = {
      [ProjectStatus.Planning]: [],
      [ProjectStatus.InProgress]: [],
      [ProjectStatus.OnHold]: [],
      [ProjectStatus.Completed]: [],
      [ProjectStatus.Active]: [],
      [ProjectStatus.Cancelled]: []
    };

    projects.forEach(project => {
      if (!project.archived && grouped[project.status]) {
        grouped[project.status].push(project);
      }
    });

    return grouped;
  }, [projects]);

  // Get swimlane groups
  const swimlaneGroups = useMemo(() => {
    if (swimlaneType === 'none') return null;

    const groups = new Map<string, { label: string; projects: Project[] }>();

    projects.filter(p => !p.archived).forEach(project => {
      let key: string;
      let label: string;

      switch (swimlaneType) {
        case 'client':
          key = project.clientId;
          label = clients.find(c => c.id === project.clientId)?.name || 'Unknown Client';
          break;
        case 'priority':
          const urgency = getUrgencyLevel(project);
          key = urgency;
          label = urgency === 'overdue' ? '🔴 Overdue' :
                  urgency === 'urgent' ? '🟠 Urgent (< 3 days)' :
                  urgency === 'soon' ? '🟡 Due Soon (< 7 days)' : '🟢 Normal';
          break;
        case 'health':
          const health = getHealthStatus(project);
          key = health;
          label = health === 'critical' ? '🔴 Critical' :
                  health === 'warning' ? '🟡 Needs Attention' : '🟢 Healthy';
          break;
        default:
          key = 'default';
          label = 'All Projects';
      }

      if (!groups.has(key)) {
        groups.set(key, { label, projects: [] });
      }
      groups.get(key)!.projects.push(project);
    });

    return Array.from(groups.entries()).sort((a, b) => {
      // Sort by priority for urgency swimlanes
      if (swimlaneType === 'priority') {
        const order = ['overdue', 'urgent', 'soon', 'normal'];
        return order.indexOf(a[0]) - order.indexOf(b[0]);
      }
      if (swimlaneType === 'health') {
        const order = ['critical', 'warning', 'healthy'];
        return order.indexOf(a[0]) - order.indexOf(b[0]);
      }
      return a[1].label.localeCompare(b[1].label);
    });
  }, [projects, clients, swimlaneType]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();

    // Check WIP limit
    const currentCount = projectsByStatus[status]?.length || 0;
    const limit = wipLimits[status];

    if (limit && currentCount >= limit && draggedProject?.status !== status) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: ProjectStatus) => {
    e.preventDefault();

    // Check WIP limit before dropping
    const currentCount = projectsByStatus[newStatus]?.length || 0;
    const limit = wipLimits[newStatus];

    if (limit && currentCount >= limit && draggedProject?.status !== newStatus) {
      setDraggedProject(null);
      setDragOverColumn(null);
      return;
    }

    if (draggedProject && draggedProject.status !== newStatus) {
      onUpdateProjectStatus(draggedProject.id, newStatus);
    }
    setDraggedProject(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
    setDragOverColumn(null);
  };

  const toggleSwimlane = (key: string) => {
    setCollapsedSwimlanes(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Project Card Component
  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const client = clients.find(c => c.id === project.clientId);
    const completedTasks = project.tasks.filter(t => t.status === 'Done').length;
    const totalTasks = project.tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const isDragging = draggedProject?.id === project.id;
    const urgency = getUrgencyLevel(project);
    const health = getHealthStatus(project);

    const urgencyBorder = {
      overdue: 'border-l-4 border-l-red-500',
      urgent: 'border-l-4 border-l-orange-500',
      soon: 'border-l-4 border-l-yellow-500',
      normal: 'border-l-4 border-l-transparent'
    };

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, project)}
        onDragEnd={handleDragEnd}
        onClick={() => onSelectProject(project.id)}
        className={`bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-move hover:shadow-md transition-all ${urgencyBorder[urgency]} ${
          isDragging ? 'opacity-50 scale-95 rotate-2' : 'opacity-100 scale-100'
        }`}
      >
        {/* Header with indicators */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 flex-1 pr-2">
            {project.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            {project.starred && (
              <StarIcon className="h-3.5 w-3.5 text-amber-500" filled />
            )}
            {/* Health indicator dot */}
            <span className={`w-2 h-2 rounded-full ${
              health === 'healthy' ? 'bg-green-500' :
              health === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`} title={`Health: ${health}`} />
          </div>
        </div>

        {/* Client */}
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 truncate">
          {client?.name || 'Unknown Client'}
        </p>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                progress >= 80 ? 'bg-green-500' :
                progress >= 50 ? 'bg-blue-500' :
                progress >= 25 ? 'bg-yellow-500' : 'bg-slate-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            {/* Task count */}
            <div className="flex items-center gap-0.5" title="Tasks">
              <CheckCircleIcon className="h-3 w-3" />
              <span>{completedTasks}/{totalTasks}</span>
            </div>
            {/* Team size */}
            {project.teamMemberIds.length > 0 && (
              <div className="flex items-center gap-0.5" title="Team members">
                <UsersIcon className="h-3 w-3" />
                <span>{project.teamMemberIds.length}</span>
              </div>
            )}
          </div>

          {/* Due date with urgency color */}
          <div className={`flex items-center gap-0.5 font-medium ${
            urgency === 'overdue' ? 'text-red-600 dark:text-red-400' :
            urgency === 'urgent' ? 'text-orange-600 dark:text-orange-400' :
            urgency === 'soon' ? 'text-yellow-600 dark:text-yellow-500' :
            'text-slate-500 dark:text-slate-400'
          }`}>
            <ClockIcon />
            <span>{new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Budget if exists */}
        {project.budget && project.budget > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <DollarSignIcon className="h-3 w-3" />
              <span>Budget</span>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              ${project.budget.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Render column
  const renderColumn = (column: KanbanColumn, columnProjects: Project[]) => {
    const isOver = dragOverColumn === column.id;
    const wipLimit = wipLimits[column.id];
    const isOverLimit = wipLimit && columnProjects.length >= wipLimit && draggedProject?.status !== column.id;
    const isAtLimit = wipLimit && columnProjects.length >= wipLimit;

    return (
      <div
        key={column.id}
        onDragOver={(e) => handleDragOver(e, column.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, column.id)}
        className={`flex-shrink-0 w-72 flex flex-col rounded-xl transition-all ${column.bgColor} ${
          isOver && !isOverLimit ? 'ring-2 ring-cyan-500 ring-offset-2' :
          isOver && isOverLimit ? 'ring-2 ring-red-500 ring-offset-2' : ''
        }`}
      >
        {/* Column Header */}
        <div className={`bg-gradient-to-r ${column.color} text-white p-3 rounded-t-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {column.icon}
              <h2 className="font-bold text-sm">{column.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* WIP indicator */}
              {wipLimit && wipLimit < 999 && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  isAtLimit ? 'bg-red-500/50' : 'bg-white/20'
                }`} title={`WIP Limit: ${wipLimit}`}>
                  {columnProjects.length}/{wipLimit}
                </span>
              )}
              {!wipLimit || wipLimit >= 999 ? (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-semibold">
                  {columnProjects.length}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Column Content */}
        <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
          {columnProjects.length === 0 ? (
            <div className="text-center py-6 text-slate-400 dark:text-slate-600">
              <p className="text-sm">No projects</p>
              {isOver && !isOverLimit && (
                <p className="text-xs mt-1 text-cyan-600 dark:text-cyan-400 font-medium">Drop here</p>
              )}
              {isOver && isOverLimit && (
                <p className="text-xs mt-1 text-red-600 dark:text-red-400 font-medium">WIP limit reached</p>
              )}
            </div>
          ) : (
            columnProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium text-sm"
            >
              ← Back
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Kanban Board</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Drag and drop to update status</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Swimlane Selector */}
          <div className="relative">
            <select
              value={swimlaneType}
              onChange={(e) => setSwimlaneType(e.target.value as SwimlaneType)}
              className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="none">No Swimlanes</option>
              <option value="client">Group by Client</option>
              <option value="priority">Group by Priority</option>
              <option value="health">Group by Health</option>
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-slate-400" />
          </div>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg border transition-colors ${
              showSettings
                ? 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="WIP Settings"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* WIP Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">WIP Limits</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {defaultColumns.filter(c => c.id !== ProjectStatus.Completed).map(column => (
              <div key={column.id}>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">{column.title}</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={wipLimits[column.id] || ''}
                  onChange={(e) => setWipLimits(prev => ({
                    ...prev,
                    [column.id]: parseInt(e.target.value) || 999
                  }))}
                  className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700"
                  placeholder="No limit"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            WIP (Work in Progress) limits help prevent overloading and improve flow.
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-600 dark:text-slate-400">Urgency:</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1 bg-red-500 rounded"></span> Overdue</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1 bg-orange-500 rounded"></span> Urgent</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1 bg-yellow-500 rounded"></span> Soon</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-600 dark:text-slate-400">Health:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Healthy</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Warning</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Critical</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        {swimlaneType === 'none' ? (
          // No swimlanes - standard view
          <div className="flex gap-4 min-w-max">
            {defaultColumns.map(column => renderColumn(column, projectsByStatus[column.id] || []))}
          </div>
        ) : (
          // With swimlanes
          <div className="space-y-4">
            {swimlaneGroups?.map(([key, group]) => (
              <div key={key} className="bg-white/50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Swimlane Header */}
                <button
                  onClick={() => toggleSwimlane(key)}
                  className="w-full px-4 py-2 flex items-center justify-between bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {collapsedSwimlanes.has(key) ? (
                      <ChevronRightIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{group.label}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({group.projects.length} project{group.projects.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                </button>

                {/* Swimlane Content */}
                {!collapsedSwimlanes.has(key) && (
                  <div className="p-4 overflow-x-auto">
                    <div className="flex gap-4 min-w-max">
                      {defaultColumns.map(column => {
                        const columnProjects = group.projects.filter(p => p.status === column.id);
                        return renderColumn(column, columnProjects);
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
