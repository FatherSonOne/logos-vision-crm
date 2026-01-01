import React, { useMemo, useState, useCallback } from 'react';
import type { Project, Client, Task } from '../../types';
import { ProjectStatus } from '../../types';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronRightIcon as ChevronRight,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  FilterIcon,
  SparklesIcon
} from '../icons';

interface ProjectStackedAgendaProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (id: string) => void;
  onSelectTask?: (task: Task, projectId: string) => void;
  onAddTask?: (date: Date) => void;
}

interface DayAgenda {
  date: Date;
  dateKey: string;
  isToday: boolean;
  isPast: boolean;
  items: AgendaItem[];
}

interface AgendaItem {
  id: string;
  type: 'project-deadline' | 'task' | 'milestone';
  title: string;
  subtitle?: string;
  time?: string;
  projectId: string;
  projectName: string;
  clientName: string;
  status: string;
  priority?: 'high' | 'medium' | 'low';
  progress?: number;
  isOverdue: boolean;
}

const PRIORITY_STYLES = {
  high: { bg: 'bg-red-500', border: 'border-red-400', text: 'text-red-500', light: 'bg-red-50' },
  medium: { bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-amber-500', light: 'bg-amber-50' },
  low: { bg: 'bg-green-500', border: 'border-green-400', text: 'text-green-500', light: 'bg-green-50' },
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.Planning]: 'bg-blue-500',
  [ProjectStatus.InProgress]: 'bg-green-500',
  [ProjectStatus.Active]: 'bg-emerald-500',
  [ProjectStatus.OnHold]: 'bg-amber-500',
  [ProjectStatus.Completed]: 'bg-purple-500',
  [ProjectStatus.Cancelled]: 'bg-gray-500',
};

// Format date helpers
const formatDayHeader = (date: Date, isToday: boolean, isTomorrow: boolean): string => {
  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const ProjectStackedAgenda: React.FC<ProjectStackedAgendaProps> = ({
  projects,
  clients,
  onSelectProject,
  onSelectTask,
  onAddTask,
}) => {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(['today']));
  const [daysToShow, setDaysToShow] = useState(14);
  const [filter, setFilter] = useState<'all' | 'high' | 'tasks' | 'deadlines'>('all');
  const [startDate, setStartDate] = useState(new Date());

  const getClientName = useCallback((clientId: string) =>
    clients.find(c => c.id === clientId)?.name || 'Unknown', [clients]);

  // Generate agenda data
  const agendaDays = useMemo((): DayAgenda[] => {
    const days: DayAgenda[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeProjects = projects.filter(p =>
      !p.archived && p.status !== ProjectStatus.Cancelled
    );

    // Generate days
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const dateKey = date.toISOString().split('T')[0];
      const isToday = isSameDay(date, today);
      const isPast = date < today;

      const items: AgendaItem[] = [];

      // Find project deadlines for this day
      activeProjects.forEach(project => {
        const endDate = new Date(project.endDate);
        endDate.setHours(0, 0, 0, 0);

        if (isSameDay(endDate, date)) {
          items.push({
            id: `project-${project.id}`,
            type: 'project-deadline',
            title: project.name,
            subtitle: 'Project Deadline',
            projectId: project.id,
            projectName: project.name,
            clientName: getClientName(project.clientId),
            status: project.status,
            priority: project.priority as 'high' | 'medium' | 'low' | undefined,
            progress: project.tasks.length > 0
              ? Math.round((project.tasks.filter(t => t.completed).length / project.tasks.length) * 100)
              : 0,
            isOverdue: isPast && project.status !== ProjectStatus.Completed,
          });
        }

        // Find tasks due on this day
        project.tasks
          .filter(task => !task.completed && task.dueDate)
          .forEach(task => {
            const taskDate = new Date(task.dueDate!);
            taskDate.setHours(0, 0, 0, 0);

            if (isSameDay(taskDate, date)) {
              items.push({
                id: `task-${task.id}`,
                type: 'task',
                title: task.description,
                subtitle: project.name,
                time: task.dueDate ? new Date(task.dueDate).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                }) : undefined,
                projectId: project.id,
                projectName: project.name,
                clientName: getClientName(project.clientId),
                status: task.completed ? 'completed' : 'pending',
                priority: task.priority as 'high' | 'medium' | 'low' | undefined,
                isOverdue: isPast,
              });
            }
          });
      });

      // Apply filters
      let filteredItems = items;
      if (filter === 'high') {
        filteredItems = items.filter(i => i.priority === 'high');
      } else if (filter === 'tasks') {
        filteredItems = items.filter(i => i.type === 'task');
      } else if (filter === 'deadlines') {
        filteredItems = items.filter(i => i.type === 'project-deadline');
      }

      // Sort by priority then time
      filteredItems.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2, undefined: 3 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
        return aPriority - bPriority;
      });

      days.push({
        date,
        dateKey,
        isToday,
        isPast,
        items: filteredItems,
      });
    }

    return days;
  }, [projects, clients, startDate, daysToShow, filter, getClientName]);

  // AI Daily Digest
  const dailyDigest = useMemo(() => {
    const todayItems = agendaDays.find(d => d.isToday)?.items || [];
    const overdueCount = agendaDays
      .filter(d => d.isPast)
      .reduce((sum, d) => sum + d.items.filter(i => i.isOverdue).length, 0);
    const highPriorityCount = todayItems.filter(i => i.priority === 'high').length;

    let message = '';
    if (todayItems.length === 0) {
      message = "Clear schedule today! A great day to get ahead.";
    } else if (highPriorityCount > 0) {
      message = `${highPriorityCount} high-priority item${highPriorityCount > 1 ? 's' : ''} need${highPriorityCount === 1 ? 's' : ''} attention today.`;
    } else {
      message = `${todayItems.length} item${todayItems.length > 1 ? 's' : ''} on your agenda today.`;
    }

    if (overdueCount > 0) {
      message += ` ${overdueCount} overdue.`;
    }

    return { message, todayCount: todayItems.length, overdueCount, highPriorityCount };
  }, [agendaDays]);

  const toggleDayExpanded = (dateKey: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateKey)) {
      newExpanded.delete(dateKey);
    } else {
      newExpanded.add(dateKey);
    }
    setExpandedDays(newExpanded);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setStartDate(newDate);
  };

  const goToToday = () => setStartDate(new Date());

  // Calculate week summary
  const weekSummary = useMemo(() => {
    return agendaDays.slice(0, 7).map(day => ({
      day: day.date.toLocaleDateString('en-US', { weekday: 'narrow' }),
      count: day.items.length,
      isToday: day.isToday,
      hasHighPriority: day.items.some(i => i.priority === 'high'),
    }));
  }, [agendaDays]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-cyan-600" />
            Agenda
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* AI Daily Digest */}
        <div className="bg-gradient-to-r from-cyan-50 to-indigo-50 dark:from-cyan-900/20 dark:to-indigo-900/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <SparklesIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-200">{dailyDigest.message}</p>
            </div>
          </div>
        </div>

        {/* Mini Week Overview */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
          {weekSummary.map((day, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center px-2 py-1 rounded-lg ${
                day.isToday ? 'bg-cyan-100 dark:bg-cyan-900/50' : ''
              }`}
            >
              <span className={`text-xs font-medium ${
                day.isToday ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {day.day}
              </span>
              <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                day.count === 0
                  ? 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                  : day.hasHighPriority
                    ? 'bg-red-500 text-white'
                    : 'bg-cyan-500 text-white'
              }`}>
                {day.count}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'high', label: 'High Priority' },
            { key: 'tasks', label: 'Tasks' },
            { key: 'deadlines', label: 'Deadlines' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors ${
                filter === f.key
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stacked Days */}
      <div className="flex-1 overflow-y-auto">
        {agendaDays.map(day => {
          const isExpanded = expandedDays.has(day.dateKey) || expandedDays.has('today') && day.isToday;
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const isTomorrow = isSameDay(day.date, tomorrow);

          return (
            <div
              key={day.dateKey}
              className={`border-b border-slate-100 dark:border-slate-700/50 ${
                day.isToday ? 'bg-cyan-50/50 dark:bg-cyan-900/10' : ''
              }`}
            >
              {/* Day Header */}
              <button
                onClick={() => toggleDayExpanded(day.dateKey)}
                className="w-full p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                  <div className="text-left">
                    <p className={`font-medium ${
                      day.isToday
                        ? 'text-cyan-700 dark:text-cyan-400'
                        : day.isPast
                          ? 'text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                    }`}>
                      {formatDayHeader(day.date, day.isToday, isTomorrow)}
                    </p>
                    {!day.isToday && !isTomorrow && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {day.items.some(i => i.priority === 'high') && (
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                    day.items.length === 0
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                      : 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300'
                  }`}>
                    {day.items.length}
                  </span>
                </div>
              </button>

              {/* Day Items */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  {day.items.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-400 dark:text-slate-500">No items scheduled</p>
                      {onAddTask && (
                        <button
                          onClick={() => onAddTask(day.date)}
                          className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg"
                        >
                          <PlusIcon className="h-3 w-3" />
                          Add task
                        </button>
                      )}
                    </div>
                  ) : (
                    day.items.map(item => {
                      const priorityStyle = item.priority ? PRIORITY_STYLES[item.priority] : null;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (item.type === 'project-deadline') {
                              onSelectProject(item.projectId);
                            } else if (item.type === 'task' && onSelectTask) {
                              const project = projects.find(p => p.id === item.projectId);
                              const taskId = item.id.replace('task-', '');
                              const task = project?.tasks.find(t => t.id === taskId);
                              if (task) onSelectTask(task, item.projectId);
                            }
                          }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                            item.isOverdue
                              ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                              : priorityStyle
                                ? `border-l-4 ${priorityStyle.border} bg-white dark:bg-slate-700`
                                : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {item.type === 'project-deadline' ? (
                                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[item.status as ProjectStatus] || 'bg-gray-400'}`} />
                                ) : (
                                  <ClockIcon className="h-3.5 w-3.5 text-slate-400" />
                                )}
                                <p className={`font-medium text-sm truncate ${
                                  item.isOverdue ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'
                                }`}>
                                  {item.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {item.subtitle || item.clientName}
                                </span>
                                {item.time && (
                                  <span className="text-xs text-slate-400 dark:text-slate-500">
                                    {item.time}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-2">
                              {item.priority && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  priorityStyle?.light
                                } ${priorityStyle?.text}`}>
                                  {item.priority}
                                </span>
                              )}
                              {item.progress !== undefined && (
                                <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-cyan-500 rounded-full"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Load More */}
        <div className="p-4 text-center">
          <button
            onClick={() => setDaysToShow(d => d + 7)}
            className="px-4 py-2 text-sm text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg"
          >
            Load more days
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectStackedAgenda;
