import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { Project, Client } from '../../types';
import { ProjectStatus } from '../../types';
import {
  ZoomInIcon,
  ZoomOutIcon,
  ChevronRightIcon,
  CalendarIcon,
  FlagIcon,
  LinkIcon,
  GitBranchIcon,
  EyeIcon,
  PlusIcon
} from '../icons';

interface DependencyArrowsProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (id: string) => void;
  onUpdateDependencies?: (projectId: string, dependsOn: string[], blockedBy: string[]) => void;
}

type ZoomLevel = 'week' | 'month' | 'quarter';

// Date helpers
const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const differenceInDays = (dateLeft: Date, dateRight: Date): number =>
  Math.round((dateLeft.getTime() - dateRight.getTime()) / (1000 * 60 * 60 * 24));

const statusColors: { [key in ProjectStatus]: { bg: string; border: string } } = {
  [ProjectStatus.Planning]: { bg: 'bg-blue-400', border: 'border-blue-500' },
  [ProjectStatus.InProgress]: { bg: 'bg-green-400', border: 'border-green-500' },
  [ProjectStatus.Completed]: { bg: 'bg-purple-400', border: 'border-purple-500' },
  [ProjectStatus.OnHold]: { bg: 'bg-orange-400', border: 'border-orange-500' },
  [ProjectStatus.Active]: { bg: 'bg-emerald-400', border: 'border-emerald-500' },
  [ProjectStatus.Cancelled]: { bg: 'bg-gray-400', border: 'border-gray-500' }
};

interface Dependency {
  fromId: string;
  toId: string;
  type: 'dependsOn' | 'blocks';
}

interface ArrowCoordinates {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type: 'dependsOn' | 'blocks';
  fromProject: Project;
  toProject: Project;
}

export const DependencyArrows: React.FC<DependencyArrowsProps> = ({
  projects,
  clients,
  onSelectProject,
  onUpdateDependencies
}) => {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('month');
  const [showDependencies, setShowDependencies] = useState(true);
  const [editingDependency, setEditingDependency] = useState<string | null>(null);
  const [hoveredArrow, setHoveredArrow] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const ROW_HEIGHT = 56;
  const HEADER_HEIGHT = 48;
  const SIDEBAR_WIDTH = 200;

  const activeProjects = projects.filter(p => !p.archived);

  // Calculate timeline bounds
  const { timelineStart, timelineEnd, totalDays, pixelsPerDay } = useMemo(() => {
    if (activeProjects.length === 0) {
      const today = new Date();
      return {
        timelineStart: startOfMonth(today),
        timelineEnd: addMonths(startOfMonth(today), 3),
        totalDays: 90,
        pixelsPerDay: 5
      };
    }

    const startDates = activeProjects.map(p => new Date(p.startDate));
    const endDates = activeProjects.map(p => new Date(p.endDate));

    const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));

    const paddedStart = addDays(startOfMonth(minDate), -7);
    const paddedEnd = addDays(new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0), 14);

    const days = Math.max(differenceInDays(paddedEnd, paddedStart), 90);

    let pxPerDay: number;
    switch (zoomLevel) {
      case 'week': pxPerDay = 12; break;
      case 'month': pxPerDay = 4; break;
      case 'quarter': pxPerDay = 2; break;
    }

    return {
      timelineStart: paddedStart,
      timelineEnd: paddedEnd,
      totalDays: days,
      pixelsPerDay: pxPerDay
    };
  }, [activeProjects, zoomLevel]);

  const totalWidth = totalDays * pixelsPerDay;

  // Extract dependencies from projects
  const dependencies = useMemo((): Dependency[] => {
    const deps: Dependency[] = [];

    activeProjects.forEach(project => {
      // Projects this one depends on
      (project.dependsOn || []).forEach(depId => {
        if (activeProjects.find(p => p.id === depId)) {
          deps.push({ fromId: depId, toId: project.id, type: 'dependsOn' });
        }
      });

      // Projects this one blocks
      (project.blockedBy || []).forEach(blockId => {
        if (activeProjects.find(p => p.id === blockId)) {
          deps.push({ fromId: project.id, toId: blockId, type: 'blocks' });
        }
      });
    });

    return deps;
  }, [activeProjects]);

  // Calculate project bar positions
  const projectBars = useMemo(() => {
    return activeProjects.map((project, index) => {
      const projectStart = new Date(project.startDate);
      const projectEnd = new Date(project.endDate);

      const offsetDays = Math.max(0, differenceInDays(projectStart, timelineStart));
      const durationDays = Math.max(1, differenceInDays(projectEnd, projectStart) + 1);

      const left = offsetDays * pixelsPerDay;
      const width = Math.max(durationDays * pixelsPerDay, 40);
      const top = HEADER_HEIGHT + index * ROW_HEIGHT + ROW_HEIGHT / 2;

      return {
        project,
        left,
        width,
        top,
        right: left + width
      };
    });
  }, [activeProjects, timelineStart, pixelsPerDay]);

  // Calculate arrow coordinates
  const arrowCoordinates = useMemo((): ArrowCoordinates[] => {
    return dependencies.map(dep => {
      const fromBar = projectBars.find(pb => pb.project.id === dep.fromId);
      const toBar = projectBars.find(pb => pb.project.id === dep.toId);

      if (!fromBar || !toBar) return null;

      return {
        fromX: fromBar.right,
        fromY: fromBar.top,
        toX: toBar.left,
        toY: toBar.top,
        type: dep.type,
        fromProject: fromBar.project,
        toProject: toBar.project
      };
    }).filter(Boolean) as ArrowCoordinates[];
  }, [dependencies, projectBars]);

  // Generate time headers
  const timeHeaders = useMemo(() => {
    const headers: { label: string; width: number }[] = [];
    let currentDate = new Date(timelineStart);

    while (currentDate < timelineEnd) {
      let endOfPeriod: Date;
      let label: string;

      switch (zoomLevel) {
        case 'week':
          endOfPeriod = addDays(currentDate, 7);
          label = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        case 'month':
          endOfPeriod = addMonths(startOfMonth(currentDate), 1);
          label = currentDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
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
        headers.push({
          label,
          width: periodDays * pixelsPerDay
        });
      }

      currentDate = endOfPeriod;
    }

    return headers;
  }, [timelineStart, timelineEnd, zoomLevel, pixelsPerDay]);

  // Today marker
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

  const getClientName = (clientId: string) =>
    clients.find(c => c.id === clientId)?.name || 'Unknown Client';

  // Draw curved arrow path
  const drawArrowPath = (coord: ArrowCoordinates): string => {
    const { fromX, fromY, toX, toY } = coord;

    // Calculate control points for a nice curved arrow
    const midX = (fromX + toX) / 2;
    const curveOffset = Math.min(40, Math.abs(toY - fromY) / 2);

    if (fromY === toY) {
      // Same row - simple straight line with slight curve
      return `M ${fromX} ${fromY} C ${fromX + 20} ${fromY}, ${toX - 20} ${toY}, ${toX - 8} ${toY}`;
    } else if (toX > fromX) {
      // Arrow goes right - normal curve
      return `M ${fromX} ${fromY}
              C ${fromX + curveOffset} ${fromY},
                ${midX} ${fromY},
                ${midX} ${(fromY + toY) / 2}
              S ${toX - curveOffset} ${toY},
                ${toX - 8} ${toY}`;
    } else {
      // Arrow goes left (reverse dependency) - loop around
      const loopHeight = Math.max(Math.abs(toY - fromY), 60);
      const loopTop = Math.min(fromY, toY) - loopHeight / 2;
      return `M ${fromX} ${fromY}
              C ${fromX + 30} ${fromY},
                ${fromX + 30} ${loopTop},
                ${midX} ${loopTop}
              S ${toX - 30} ${loopTop},
                ${toX - 30} ${toY}
              S ${toX - 8} ${toY},
                ${toX - 8} ${toY}`;
    }
  };

  // Handle adding dependency
  const handleAddDependency = (projectId: string, dependencyId: string, type: 'dependsOn' | 'blocks') => {
    if (onUpdateDependencies) {
      const project = activeProjects.find(p => p.id === projectId);
      if (project) {
        if (type === 'dependsOn') {
          const newDeps = [...(project.dependsOn || []), dependencyId];
          onUpdateDependencies(projectId, newDeps, project.blockedBy || []);
        } else {
          const newBlocks = [...(project.blockedBy || []), dependencyId];
          onUpdateDependencies(projectId, project.dependsOn || [], newBlocks);
        }
      }
    }
    setEditingDependency(null);
  };

  if (activeProjects.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
        <GitBranchIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">No projects to display dependencies.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <GitBranchIcon className="h-5 w-5 text-cyan-600" />
            Project Dependencies
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Dependencies */}
          <button
            onClick={() => setShowDependencies(!showDependencies)}
            className={`px-3 py-1.5 text-sm rounded-lg border flex items-center gap-2 transition-colors ${
              showDependencies
                ? 'bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-900/30 dark:border-cyan-700 dark:text-cyan-300'
                : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
            }`}
          >
            <EyeIcon />
            {showDependencies ? 'Hide' : 'Show'} Arrows
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-600 rounded-lg">
            <button
              onClick={() => {
                const levels: ZoomLevel[] = ['quarter', 'month', 'week'];
                const idx = levels.indexOf(zoomLevel);
                if (idx > 0) setZoomLevel(levels[idx - 1]);
              }}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-lg"
              title="Zoom Out"
            >
              <ZoomOutIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </button>
            <span className="px-2 text-xs text-slate-500 dark:text-slate-400 capitalize border-x border-slate-200 dark:border-slate-600">
              {zoomLevel}
            </span>
            <button
              onClick={() => {
                const levels: ZoomLevel[] = ['quarter', 'month', 'week'];
                const idx = levels.indexOf(zoomLevel);
                if (idx < levels.length - 1) setZoomLevel(levels[idx + 1]);
              }}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-lg"
              title="Zoom In"
            >
              <ZoomInIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-cyan-500 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-cyan-500" />
          </div>
          <span className="text-slate-600 dark:text-slate-400">Depends On</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-orange-500 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-orange-500" />
          </div>
          <span className="text-slate-600 dark:text-slate-400">Blocks</span>
        </div>
        <div className="flex items-center gap-2 ml-auto text-slate-500 dark:text-slate-400">
          <LinkIcon className="h-3.5 w-3.5" />
          {dependencies.length} dependencies
        </div>
      </div>

      {/* Main content */}
      <div className="flex">
        {/* Sidebar with project names */}
        <div
          className="flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
          style={{ width: SIDEBAR_WIDTH }}
        >
          {/* Header spacer */}
          <div
            className="border-b border-slate-200 dark:border-slate-700 px-3 flex items-center"
            style={{ height: HEADER_HEIGHT }}
          >
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Projects</span>
          </div>

          {/* Project list */}
          {activeProjects.map((project, index) => (
            <div
              key={project.id}
              className={`px-3 border-b border-slate-100 dark:border-slate-700/50 flex items-center cursor-pointer transition-colors ${
                selectedProject === project.id
                  ? 'bg-cyan-50 dark:bg-cyan-900/20'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
              style={{ height: ROW_HEIGHT }}
              onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {project.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {getClientName(project.clientId)}
                </p>
              </div>
              {(project.dependsOn?.length || project.blockedBy?.length) ? (
                <div className="ml-2 flex items-center gap-1">
                  <span className="text-xs px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 rounded">
                    {(project.dependsOn?.length || 0) + (project.blockedBy?.length || 0)}
                  </span>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* Scrollable timeline area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto"
        >
          <div style={{ width: totalWidth, minWidth: '100%' }}>
            {/* Time headers */}
            <div
              className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              style={{ height: HEADER_HEIGHT }}
            >
              {timeHeaders.map((header, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 border-r border-slate-200 dark:border-slate-700 px-2 flex items-center"
                  style={{ width: header.width }}
                >
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                    {header.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Timeline content with SVG overlay */}
            <div className="relative" style={{ height: activeProjects.length * ROW_HEIGHT }}>
              {/* Background grid rows */}
              {activeProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="absolute left-0 right-0 border-b border-slate-100 dark:border-slate-700/50"
                  style={{
                    top: index * ROW_HEIGHT,
                    height: ROW_HEIGHT,
                    backgroundColor: selectedProject === project.id
                      ? 'rgba(6, 182, 212, 0.05)'
                      : 'transparent'
                  }}
                />
              ))}

              {/* Today line */}
              {todayPosition !== null && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                  style={{ left: todayPosition }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded whitespace-nowrap">
                    Today
                  </div>
                </div>
              )}

              {/* Project bars */}
              {projectBars.map((bar) => {
                const colors = statusColors[bar.project.status] || statusColors[ProjectStatus.Planning];
                const hasDeps = (bar.project.dependsOn?.length || 0) > 0 || (bar.project.blockedBy?.length || 0) > 0;

                return (
                  <div
                    key={bar.project.id}
                    className={`absolute rounded-lg shadow-sm cursor-pointer transition-all border-2 ${colors.bg} ${colors.border} ${
                      selectedProject === bar.project.id ? 'ring-2 ring-cyan-400 ring-offset-1' : ''
                    }`}
                    style={{
                      left: bar.left,
                      top: bar.top - 12,
                      width: bar.width,
                      height: 24
                    }}
                    onClick={() => onSelectProject(bar.project.id)}
                    title={`${bar.project.name}\nClick to view details`}
                  >
                    <div className="h-full flex items-center px-2 overflow-hidden">
                      <span className="text-xs font-medium text-white truncate">
                        {bar.project.name}
                      </span>
                    </div>

                    {/* Dependency indicator dots */}
                    {hasDeps && (
                      <>
                        {(bar.project.dependsOn?.length || 0) > 0 && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-cyan-500 rounded-full border border-white" />
                        )}
                        {(bar.project.blockedBy?.length || 0) > 0 && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-orange-500 rounded-full border border-white" />
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              {/* SVG Overlay for dependency arrows */}
              {showDependencies && arrowCoordinates.length > 0 && (
                <svg
                  ref={svgRef}
                  className="absolute inset-0 pointer-events-none z-20"
                  style={{ width: totalWidth, height: activeProjects.length * ROW_HEIGHT }}
                >
                  <defs>
                    {/* Arrow markers */}
                    <marker
                      id="arrow-depends"
                      markerWidth="8"
                      markerHeight="8"
                      refX="6"
                      refY="4"
                      orient="auto"
                      markerUnits="userSpaceOnUse"
                    >
                      <path d="M 0 0 L 8 4 L 0 8 Z" fill="#06b6d4" />
                    </marker>
                    <marker
                      id="arrow-blocks"
                      markerWidth="8"
                      markerHeight="8"
                      refX="6"
                      refY="4"
                      orient="auto"
                      markerUnits="userSpaceOnUse"
                    >
                      <path d="M 0 0 L 8 4 L 0 8 Z" fill="#f97316" />
                    </marker>
                    <marker
                      id="arrow-depends-hover"
                      markerWidth="10"
                      markerHeight="10"
                      refX="7"
                      refY="5"
                      orient="auto"
                      markerUnits="userSpaceOnUse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 Z" fill="#0891b2" />
                    </marker>
                    <marker
                      id="arrow-blocks-hover"
                      markerWidth="10"
                      markerHeight="10"
                      refX="7"
                      refY="5"
                      orient="auto"
                      markerUnits="userSpaceOnUse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 Z" fill="#ea580c" />
                    </marker>
                  </defs>

                  {arrowCoordinates.map((coord, idx) => {
                    const arrowId = `${coord.fromProject.id}-${coord.toProject.id}`;
                    const isHovered = hoveredArrow === arrowId;
                    const isSelected = selectedProject === coord.fromProject.id || selectedProject === coord.toProject.id;
                    const baseColor = coord.type === 'dependsOn' ? '#06b6d4' : '#f97316';
                    const hoverColor = coord.type === 'dependsOn' ? '#0891b2' : '#ea580c';
                    const markerEnd = isHovered
                      ? `url(#arrow-${coord.type === 'dependsOn' ? 'depends' : 'blocks'}-hover)`
                      : `url(#arrow-${coord.type === 'dependsOn' ? 'depends' : 'blocks'})`;

                    return (
                      <g key={idx} className="pointer-events-auto">
                        {/* Invisible wider path for easier hovering */}
                        <path
                          d={drawArrowPath(coord)}
                          fill="none"
                          stroke="transparent"
                          strokeWidth="12"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredArrow(arrowId)}
                          onMouseLeave={() => setHoveredArrow(null)}
                        />
                        {/* Visible arrow */}
                        <path
                          d={drawArrowPath(coord)}
                          fill="none"
                          stroke={isHovered || isSelected ? hoverColor : baseColor}
                          strokeWidth={isHovered || isSelected ? 3 : 2}
                          strokeDasharray={coord.type === 'blocks' ? '4 2' : undefined}
                          markerEnd={markerEnd}
                          className="transition-all duration-150"
                          style={{
                            opacity: isHovered || isSelected ? 1 : 0.7,
                            filter: isHovered ? 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' : 'none'
                          }}
                        />

                        {/* Tooltip on hover */}
                        {isHovered && (
                          <foreignObject
                            x={(coord.fromX + coord.toX) / 2 - 100}
                            y={Math.min(coord.fromY, coord.toY) - 40}
                            width="200"
                            height="36"
                          >
                            <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg text-center">
                              {coord.fromProject.name} → {coord.toProject.name}
                              <div className="text-slate-300 text-[10px]">
                                {coord.type === 'dependsOn' ? 'depends on' : 'blocks'}
                              </div>
                            </div>
                          </foreignObject>
                        )}
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected project dependency panel */}
      {selectedProject && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          {(() => {
            const project = activeProjects.find(p => p.id === selectedProject);
            if (!project) return null;

            return (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                    Depends On ({project.dependsOn?.length || 0})
                  </h4>
                  <div className="space-y-1">
                    {(project.dependsOn || []).map(depId => {
                      const depProject = activeProjects.find(p => p.id === depId);
                      return depProject ? (
                        <div
                          key={depId}
                          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 px-2 py-1 bg-white dark:bg-slate-700 rounded"
                        >
                          <ChevronRightIcon className="h-3 w-3" />
                          {depProject.name}
                        </div>
                      ) : null;
                    })}
                    {(!project.dependsOn || project.dependsOn.length === 0) && (
                      <p className="text-xs text-slate-400 italic">No dependencies</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    Blocks ({project.blockedBy?.length || 0})
                  </h4>
                  <div className="space-y-1">
                    {(project.blockedBy || []).map(blockId => {
                      const blockProject = activeProjects.find(p => p.id === blockId);
                      return blockProject ? (
                        <div
                          key={blockId}
                          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 px-2 py-1 bg-white dark:bg-slate-700 rounded"
                        >
                          <ChevronRightIcon className="h-3 w-3" />
                          {blockProject.name}
                        </div>
                      ) : null;
                    })}
                    {(!project.blockedBy || project.blockedBy.length === 0) && (
                      <p className="text-xs text-slate-400 italic">Doesn't block any projects</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default DependencyArrows;
