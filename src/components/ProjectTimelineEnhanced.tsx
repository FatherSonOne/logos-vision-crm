import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { Project, Client } from '../types';
import { ProjectStatus } from '../types';
import {
  ZoomInIcon,
  ZoomOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  FlagIcon,
  CheckCircleIcon,
  ClockIcon,
  DollarSignIcon,
  StarIcon
} from './icons';

interface ProjectTimelineEnhancedProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (id: string) => void;
  onBackToHub?: () => void;
}

type ZoomLevel = 'day' | 'week' | 'month' | 'quarter';

// Date helpers
const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);
const startOfWeek = (date: Date): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
};

const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const differenceInDays = (dateLeft: Date, dateRight: Date): number =>
  Math.round((dateLeft.getTime() - dateRight.getTime()) / (1000 * 60 * 60 * 24));

const formatDate = (date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string => {
  if (format === 'short') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (format === 'medium') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const statusColors: { [key in ProjectStatus]: { bg: string; border: string; text: string } } = {
  [ProjectStatus.Planning]: { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-blue-700' },
  [ProjectStatus.InProgress]: { bg: 'bg-green-500', border: 'border-green-600', text: 'text-green-700' },
  [ProjectStatus.Completed]: { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-purple-700' },
  [ProjectStatus.OnHold]: { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-orange-700' },
  [ProjectStatus.Active]: { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-emerald-700' },
  [ProjectStatus.Cancelled]: { bg: 'bg-gray-500', border: 'border-gray-600', text: 'text-gray-700' }
};

export const ProjectTimelineEnhanced: React.FC<ProjectTimelineEnhancedProps> = ({
  projects,
  clients,
  onSelectProject,
  onBackToHub
}) => {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('month');
  const [showMilestones, setShowMilestones] = useState(true);
  const [showBudget, setShowBudget] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  const activeProjects = projects.filter(p => !p.archived);

  // Calculate timeline bounds
  const { timelineStart, timelineEnd, totalDays, daysPerUnit, unitCount } = useMemo(() => {
    if (activeProjects.length === 0) {
      const today = new Date();
      return {
        timelineStart: startOfMonth(today),
        timelineEnd: addMonths(startOfMonth(today), 3),
        totalDays: 90,
        daysPerUnit: 30,
        unitCount: 3
      };
    }

    const startDates = activeProjects.map(p => new Date(p.startDate));
    const endDates = activeProjects.map(p => new Date(p.endDate));

    const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));

    // Add padding
    const paddedStart = addDays(startOfMonth(minDate), -7);
    const paddedEnd = addDays(new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0), 14);

    const totalDays = differenceInDays(paddedEnd, paddedStart);

    // Calculate units based on zoom
    let daysPerUnit: number;
    switch (zoomLevel) {
      case 'day': daysPerUnit = 1; break;
      case 'week': daysPerUnit = 7; break;
      case 'month': daysPerUnit = 30; break;
      case 'quarter': daysPerUnit = 90; break;
    }

    return {
      timelineStart: paddedStart,
      timelineEnd: paddedEnd,
      totalDays: totalDays > 0 ? totalDays : 90,
      daysPerUnit,
      unitCount: Math.ceil(totalDays / daysPerUnit)
    };
  }, [activeProjects, zoomLevel]);

  // Calculate pixel width per day based on zoom
  const pixelsPerDay = useMemo(() => {
    switch (zoomLevel) {
      case 'day': return 40;
      case 'week': return 15;
      case 'month': return 5;
      case 'quarter': return 2;
    }
  }, [zoomLevel]);

  const totalWidth = totalDays * pixelsPerDay;

  // Generate time headers
  const timeHeaders = useMemo(() => {
    const headers: { label: string; width: number; isToday?: boolean }[] = [];
    let currentDate = new Date(timelineStart);

    while (currentDate < timelineEnd) {
      let endOfPeriod: Date;
      let label: string;

      switch (zoomLevel) {
        case 'day':
          endOfPeriod = addDays(currentDate, 1);
          label = currentDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
          break;
        case 'week':
          endOfPeriod = addDays(startOfWeek(currentDate), 7);
          label = `Week of ${formatDate(currentDate, 'short')}`;
          break;
        case 'month':
          endOfPeriod = addMonths(startOfMonth(currentDate), 1);
          label = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          break;
        case 'quarter':
          const quarter = Math.floor(currentDate.getMonth() / 3) + 1;
          endOfPeriod = addMonths(startOfMonth(currentDate), 3);
          label = `Q${quarter} ${currentDate.getFullYear()}`;
          break;
      }

      const periodDays = Math.min(
        differenceInDays(endOfPeriod, currentDate),
        differenceInDays(timelineEnd, currentDate)
      );

      if (periodDays > 0) {
        const today = new Date();
        const isToday = currentDate <= today && today < endOfPeriod;
        headers.push({
          label,
          width: periodDays * pixelsPerDay,
          isToday
        });
      }

      currentDate = endOfPeriod;
    }

    return headers;
  }, [timelineStart, timelineEnd, zoomLevel, pixelsPerDay]);

  // Today position
  const today = new Date();
  const todayPosition = today >= timelineStart && today <= timelineEnd
    ? differenceInDays(today, timelineStart) * pixelsPerDay
    : null;

  // Scroll to today on mount
  useEffect(() => {
    if (scrollContainerRef.current && todayPosition !== null) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollLeft = todayPosition - containerWidth / 2;
    }
  }, [todayPosition, zoomLevel]);

  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Unknown Client';

  // Calculate project position and width
  const getProjectPosition = (project: Project) => {
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);

    if (projectEnd < timelineStart || projectStart > timelineEnd) return null;

    const offsetDays = Math.max(0, differenceInDays(projectStart, timelineStart));
    const durationDays = Math.max(1, differenceInDays(projectEnd, projectStart) + 1);

    const left = offsetDays * pixelsPerDay;
    const width = durationDays * pixelsPerDay;

    return { left, width, projectStart, projectEnd };
  };

  // Get milestones (tasks with due dates or 25%, 50%, 75% markers)
  const getMilestones = (project: Project) => {
    const milestones: { position: number; label: string; type: 'task' | 'progress' }[] = [];
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);
    const duration = differenceInDays(projectEnd, projectStart);

    // Add 50% milestone
    const midpoint = addDays(projectStart, Math.floor(duration / 2));
    if (midpoint > timelineStart && midpoint < timelineEnd) {
      const pos = differenceInDays(midpoint, timelineStart) * pixelsPerDay;
      milestones.push({ position: pos, label: '50%', type: 'progress' });
    }

    // Add task milestones (tasks with due dates)
    project.tasks.filter(t => t.dueDate).forEach(task => {
      const taskDate = new Date(task.dueDate);
      if (taskDate > timelineStart && taskDate < timelineEnd) {
        const pos = differenceInDays(taskDate, timelineStart) * pixelsPerDay;
        milestones.push({
          position: pos,
          label: task.description.substring(0, 20) + (task.description.length > 20 ? '...' : ''),
          type: 'task'
        });
      }
    });

    return milestones;
  };

  const handleZoomIn = () => {
    const levels: ZoomLevel[] = ['quarter', 'month', 'week', 'day'];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex < levels.length - 1) {
      setZoomLevel(levels[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const levels: ZoomLevel[] = ['quarter', 'month', 'week', 'day'];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(levels[currentIndex - 1]);
    }
  };

  const scrollToToday = () => {
    if (scrollContainerRef.current && todayPosition !== null) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: todayPosition - containerWidth / 2,
        behavior: 'smooth'
      });
    }
  };

  if (activeProjects.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
        <CalendarIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">No projects to display in timeline view.</p>
        {onBackToHub && (
          <button
            onClick={onBackToHub}
            className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            Back to Command Center
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium text-sm"
            >
              ← Back
            </button>
          )}
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Project Timeline</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggles */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showMilestones}
              onChange={(e) => setShowMilestones(e.target.checked)}
              className="rounded text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-slate-700 dark:text-slate-300">Milestones</span>
          </label>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showBudget}
              onChange={(e) => setShowBudget(e.target.checked)}
              className="rounded text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-slate-700 dark:text-slate-300">Budget</span>
          </label>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel === 'quarter'}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom out"
            >
              <ZoomOutIcon className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-medium text-slate-600 dark:text-slate-400 min-w-[60px] text-center">
              {zoomLevel.charAt(0).toUpperCase() + zoomLevel.slice(1)}
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel === 'day'}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom in"
            >
              <ZoomInIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Go to today */}
          <button
            onClick={scrollToToday}
            className="flex items-center gap-1 px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg text-sm font-medium hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
          >
            <CalendarIcon className="h-4 w-4" />
            Today
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto" ref={scrollContainerRef}>
        <div style={{ width: `${Math.max(totalWidth, 800)}px`, minWidth: '100%' }}>
          {/* Time Headers */}
          <div className="flex border-b-2 border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
            {timeHeaders.map((header, index) => (
              <div
                key={index}
                style={{ width: `${header.width}px` }}
                className={`text-xs text-center font-medium py-2 border-r border-slate-200 dark:border-slate-700 ${
                  header.isToday
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {header.label}
              </div>
            ))}
          </div>

          {/* Project Rows */}
          <div className="relative">
            {/* Today indicator line */}
            {todayPosition !== null && (
              <div
                ref={todayRef}
                className="absolute top-0 bottom-0 z-20 pointer-events-none"
                style={{ left: `${todayPosition}px` }}
              >
                <div className="w-0.5 h-full bg-violet-500 shadow-lg shadow-violet-500/50"></div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-violet-500 text-white text-xs font-bold rounded-full whitespace-nowrap">
                  Today
                </div>
              </div>
            )}

            {/* Projects */}
            {activeProjects.map((project, idx) => {
              const position = getProjectPosition(project);
              if (!position) return null;

              const { left, width, projectStart, projectEnd } = position;
              const colors = statusColors[project.status] || statusColors[ProjectStatus.InProgress];
              const progress = project.tasks.length > 0
                ? (project.tasks.filter(t => t.status === 'Done').length / project.tasks.length) * 100
                : 0;
              const milestones = showMilestones ? getMilestones(project) : [];
              const isHovered = hoveredProject === project.id;

              return (
                <div
                  key={project.id}
                  className="relative h-16 border-b border-slate-100 dark:border-slate-700 group"
                >
                  {/* Project bar */}
                  <div
                    className={`absolute top-2 h-12 rounded-lg cursor-pointer transition-all duration-200 ${colors.bg} ${
                      isHovered ? 'ring-2 ring-offset-2 ring-cyan-500 shadow-lg scale-[1.02]' : 'hover:shadow-md'
                    }`}
                    style={{ left: `${left}px`, width: `${Math.max(width, 60)}px` }}
                    onClick={() => onSelectProject(project.id)}
                    onMouseEnter={() => setHoveredProject(project.id)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    {/* Progress overlay */}
                    <div
                      className="absolute inset-0 bg-white/30 rounded-lg"
                      style={{ width: `${progress}%` }}
                    />

                    {/* Content */}
                    <div className="relative z-10 h-full px-3 flex items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {project.starred && <StarIcon className="h-3 w-3 text-amber-200" filled />}
                          <span className="text-xs text-white font-bold truncate">
                            {project.name}
                          </span>
                        </div>
                        {width > 100 && (
                          <span className="text-[10px] text-white/80 truncate block">
                            {getClientName(project.clientId)}
                          </span>
                        )}
                      </div>

                      {/* Budget badge */}
                      {showBudget && project.budget && width > 120 && (
                        <div className="flex items-center gap-0.5 bg-white/20 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">
                          <DollarSignIcon className="h-2.5 w-2.5" />
                          {project.budget >= 1000 ? `${(project.budget / 1000).toFixed(0)}k` : project.budget}
                        </div>
                      )}
                    </div>

                    {/* Start/End markers */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/40 rounded-l-lg" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/40 rounded-r-lg" />
                  </div>

                  {/* Milestones */}
                  {showMilestones && milestones.map((milestone, mIdx) => (
                    <div
                      key={mIdx}
                      className="absolute top-1 z-30"
                      style={{ left: `${milestone.position}px` }}
                      title={milestone.label}
                    >
                      <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                        milestone.type === 'task' ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}>
                        {milestone.type === 'task' && (
                          <FlagIcon className="h-2 w-2 text-white absolute top-0.5 left-0.5" />
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Hover tooltip */}
                  {isHovered && (
                    <div
                      className="absolute z-40 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg shadow-xl p-3 pointer-events-none"
                      style={{
                        left: `${Math.min(left + width / 2, totalWidth - 200)}px`,
                        top: '52px',
                        transform: 'translateX(-50%)',
                        minWidth: '180px'
                      }}
                    >
                      <p className="font-bold mb-1">{project.name}</p>
                      <p className="text-slate-300 mb-2">{getClientName(project.clientId)}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                        <span className="text-slate-400">Status:</span>
                        <span>{project.status}</span>
                        <span className="text-slate-400">Progress:</span>
                        <span>{Math.round(progress)}%</span>
                        <span className="text-slate-400">Start:</span>
                        <span>{formatDate(projectStart, 'short')}</span>
                        <span className="text-slate-400">End:</span>
                        <span>{formatDate(projectEnd, 'short')}</span>
                        {project.budget && (
                          <>
                            <span className="text-slate-400">Budget:</span>
                            <span>${project.budget.toLocaleString()}</span>
                          </>
                        )}
                      </div>
                      {/* Arrow */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900 dark:border-b-slate-700" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-600 dark:text-slate-400">Status:</span>
          {Object.entries(statusColors).slice(0, 4).map(([status, colors]) => (
            <span key={status} className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded ${colors.bg}`}></span>
              <span className="text-slate-600 dark:text-slate-400">{status}</span>
            </span>
          ))}
        </div>
        {showMilestones && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600 dark:text-slate-400">Milestones:</span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
              <span className="text-slate-600 dark:text-slate-400">Progress</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-slate-600 dark:text-slate-400">Task</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
