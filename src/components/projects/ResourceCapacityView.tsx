import React, { useMemo, useState } from 'react';
import type { Project, Client, TeamMember } from '../../types';
import { ProjectStatus } from '../../types';
import {
  UsersIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationIcon
} from '../icons';

interface ResourceCapacityViewProps {
  projects: Project[];
  clients: Client[];
  teamMembers: TeamMember[];
  onSelectProject?: (id: string) => void;
}

type ViewMode = 'week' | 'month';

interface WorkloadEntry {
  projectId: string;
  projectName: string;
  clientName: string;
  hours: number;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  taskCount: number;
}

interface MemberWorkload {
  member: TeamMember;
  totalHours: number;
  capacityPercentage: number;
  projects: WorkloadEntry[];
  overloaded: boolean;
  underutilized: boolean;
}

// Date helpers
const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const startOfWeek = (date: Date): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const endOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const formatDateRange = (start: Date, end: Date): string => {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} - ${end.toLocaleDateString('en-US', opts)}`;
};

const formatMonth = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const HOURS_PER_WEEK = 40; // Standard work week
const HOURS_PER_MONTH = 160; // Approximate monthly hours
const OVERLOAD_THRESHOLD = 100; // Percentage
const UNDERUTILIZED_THRESHOLD = 50; // Percentage

const statusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.Planning]: 'bg-blue-400',
  [ProjectStatus.InProgress]: 'bg-green-400',
  [ProjectStatus.Completed]: 'bg-purple-400',
  [ProjectStatus.OnHold]: 'bg-orange-400',
  [ProjectStatus.Active]: 'bg-emerald-400',
  [ProjectStatus.Cancelled]: 'bg-gray-400'
};

export const ResourceCapacityView: React.FC<ResourceCapacityViewProps> = ({
  projects,
  clients,
  teamMembers,
  onSelectProject
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentPeriod, setCurrentPeriod] = useState(new Date());
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  // Calculate period bounds
  const { periodStart, periodEnd, periodLabel, capacityHours } = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentPeriod);
      const end = addDays(start, 6);
      return {
        periodStart: start,
        periodEnd: end,
        periodLabel: formatDateRange(start, end),
        capacityHours: HOURS_PER_WEEK
      };
    } else {
      const start = startOfMonth(currentPeriod);
      const end = endOfMonth(currentPeriod);
      return {
        periodStart: start,
        periodEnd: end,
        periodLabel: formatMonth(currentPeriod),
        capacityHours: HOURS_PER_MONTH
      };
    }
  }, [viewMode, currentPeriod]);

  const getClientName = (clientId: string) =>
    clients.find(c => c.id === clientId)?.name || 'Unknown Client';

  // Calculate workload per team member
  const memberWorkloads = useMemo((): MemberWorkload[] => {
    const activeProjects = projects.filter(p =>
      !p.archived &&
      p.status !== ProjectStatus.Completed &&
      p.status !== ProjectStatus.Cancelled
    );

    return teamMembers.map(member => {
      // Find projects this member is assigned to
      const assignedProjects = activeProjects.filter(project =>
        project.teamMembers?.some(tm => tm.id === member.id || tm.name === member.name)
      );

      // Calculate workload entries
      const workloadEntries: WorkloadEntry[] = assignedProjects.map(project => {
        const projectStart = new Date(project.startDate);
        const projectEnd = new Date(project.endDate);

        // Check if project overlaps with current period
        if (projectEnd < periodStart || projectStart > periodEnd) {
          return null;
        }

        // Calculate tasks assigned to this member
        const memberTasks = project.tasks.filter(task =>
          !task.completed && (
            task.assigneeId === member.id ||
            task.description?.toLowerCase().includes(member.name.toLowerCase())
          )
        );

        // Estimate hours based on tasks or project duration
        const projectDurationDays = Math.max(1,
          Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24))
        );

        // Calculate overlap with current period
        const overlapStart = new Date(Math.max(projectStart.getTime(), periodStart.getTime()));
        const overlapEnd = new Date(Math.min(projectEnd.getTime(), periodEnd.getTime()));
        const overlapDays = Math.max(1,
          Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24))
        );

        // Estimate hours (assume even distribution of work)
        const teamMemberCount = project.teamMembers?.length || 1;
        const totalProjectHours = project.budget
          ? Math.min(project.budget * 0.5, projectDurationDays * 4) // Rough estimate
          : projectDurationDays * 4;

        const memberShare = totalProjectHours / teamMemberCount;
        const periodShare = (overlapDays / projectDurationDays) * memberShare;

        return {
          projectId: project.id,
          projectName: project.name,
          clientName: getClientName(project.clientId),
          hours: Math.round(periodShare * 10) / 10,
          status: project.status,
          startDate: projectStart,
          endDate: projectEnd,
          taskCount: memberTasks.length
        };
      }).filter(Boolean) as WorkloadEntry[];

      const totalHours = workloadEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const capacityPercentage = Math.round((totalHours / capacityHours) * 100);

      return {
        member,
        totalHours: Math.round(totalHours * 10) / 10,
        capacityPercentage,
        projects: workloadEntries,
        overloaded: capacityPercentage > OVERLOAD_THRESHOLD,
        underutilized: capacityPercentage < UNDERUTILIZED_THRESHOLD
      };
    }).sort((a, b) => b.capacityPercentage - a.capacityPercentage);
  }, [projects, teamMembers, periodStart, periodEnd, capacityHours, clients]);

  // Summary stats
  const stats = useMemo(() => {
    const overloaded = memberWorkloads.filter(m => m.overloaded).length;
    const underutilized = memberWorkloads.filter(m => m.underutilized).length;
    const optimal = memberWorkloads.filter(m => !m.overloaded && !m.underutilized).length;
    const avgCapacity = memberWorkloads.length > 0
      ? Math.round(memberWorkloads.reduce((sum, m) => sum + m.capacityPercentage, 0) / memberWorkloads.length)
      : 0;

    return { overloaded, underutilized, optimal, avgCapacity };
  }, [memberWorkloads]);

  const toggleMemberExpand = (memberId: string) => {
    const newExpanded = new Set(expandedMembers);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    setExpandedMembers(newExpanded);
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      setCurrentPeriod(addDays(currentPeriod, direction === 'prev' ? -7 : 7));
    } else {
      const newDate = new Date(currentPeriod);
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
      setCurrentPeriod(newDate);
    }
  };

  const goToToday = () => {
    setCurrentPeriod(new Date());
  };

  const getCapacityBarColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 85) return 'bg-orange-500';
    if (percentage > 50) return 'bg-green-500';
    return 'bg-blue-400';
  };

  const getCapacityBgColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-50 dark:bg-red-900/20';
    if (percentage < 50) return 'bg-blue-50 dark:bg-blue-900/20';
    return 'bg-white dark:bg-slate-800';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-cyan-600" />
              Resource Capacity
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Team workload and availability for {periodLabel}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Month
              </button>
            </div>

            {/* Period navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigatePeriod('prev')}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <ChevronLeftIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-sm text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => navigatePeriod('next')}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <ChevronRightIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgCapacity}%</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Avg Capacity</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.optimal}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Optimal Load</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.overloaded}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Overloaded</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.underutilized}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Available</div>
        </div>
      </div>

      {/* Team member list */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {memberWorkloads.length === 0 ? (
          <div className="p-8 text-center">
            <UsersIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No team members found</p>
          </div>
        ) : (
          memberWorkloads.map((workload) => {
            const isExpanded = expandedMembers.has(workload.member.id);

            return (
              <div
                key={workload.member.id}
                className={`transition-colors ${getCapacityBgColor(workload.capacityPercentage)}`}
              >
                {/* Member row */}
                <div
                  className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  onClick={() => toggleMemberExpand(workload.member.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium">
                        {workload.member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      {workload.overloaded && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                          <ExclamationIcon className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Name and role */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {workload.member.name}
                        </p>
                        {workload.overloaded && (
                          <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded">
                            Overloaded
                          </span>
                        )}
                        {workload.underutilized && (
                          <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded">
                            Available
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {workload.member.role || 'Team Member'} • {workload.projects.length} projects
                      </p>
                    </div>

                    {/* Hours and capacity */}
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-900 dark:text-white">
                        {workload.totalHours}h
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        of {capacityHours}h capacity
                      </div>
                    </div>

                    {/* Capacity bar */}
                    <div className="w-32 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getCapacityBarColor(workload.capacityPercentage)}`}
                            style={{ width: `${Math.min(workload.capacityPercentage, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${
                          workload.overloaded ? 'text-red-600' :
                          workload.underutilized ? 'text-blue-600' :
                          'text-slate-700 dark:text-slate-300'
                        }`}>
                          {workload.capacityPercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Expand arrow */}
                    <ChevronRightIcon
                      className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </div>
                </div>

                {/* Expanded project details */}
                {isExpanded && workload.projects.length > 0 && (
                  <div className="px-4 pb-4 pl-18">
                    <div className="ml-14 space-y-2">
                      {workload.projects.map((entry) => (
                        <div
                          key={entry.projectId}
                          className={`flex items-center gap-3 p-3 bg-white dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600 cursor-pointer transition-colors ${
                            hoveredProject === entry.projectId ? 'ring-2 ring-cyan-400' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject?.(entry.projectId);
                          }}
                          onMouseEnter={() => setHoveredProject(entry.projectId)}
                          onMouseLeave={() => setHoveredProject(null)}
                        >
                          {/* Status dot */}
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[entry.status]}`} />

                          {/* Project info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                              {entry.projectName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {entry.clientName} • {entry.taskCount} active tasks
                            </p>
                          </div>

                          {/* Hours allocation */}
                          <div className="text-right">
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {entry.hours}h
                            </div>
                            <div className="text-xs text-slate-400">
                              {Math.round((entry.hours / capacityHours) * 100)}%
                            </div>
                          </div>

                          {/* Mini capacity bar */}
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${statusColors[entry.status]}`}
                              style={{ width: `${Math.min((entry.hours / capacityHours) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state when expanded */}
                {isExpanded && workload.projects.length === 0 && (
                  <div className="px-4 pb-4 pl-18">
                    <div className="ml-14 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-center">
                      <CalendarIcon className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No projects assigned for this period
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer with legend */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>50-85% (Optimal)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span>85-100% (High)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span>&gt;100% (Overloaded)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-400" />
              <span>&lt;50% (Available)</span>
            </div>
          </div>
          <div>
            Capacity based on {viewMode === 'week' ? '40' : '160'} hours / {viewMode}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCapacityView;
