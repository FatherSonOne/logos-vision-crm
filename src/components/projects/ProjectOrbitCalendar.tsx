import React, { useMemo, useState, useCallback, useEffect } from 'react';
import type { Project, Client, Task } from '../../types';
import { ProjectStatus } from '../../types';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ZoomInIcon,
  ZoomOutIcon,
  EyeIcon,
  FilterIcon,
  StarIcon
} from '../icons';

// Hook to detect dark mode
const useDarkMode = (): boolean => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for dark class on document
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
};

interface ProjectOrbitCalendarProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (id: string) => void;
  onSelectTask?: (task: Task, projectId: string) => void;
}

type OrbitRing = 'today' | 'week' | 'month' | 'quarter';
type ViewMode = 'projects' | 'tasks' | 'milestones';

interface OrbitItem {
  id: string;
  name: string;
  type: 'project' | 'task' | 'milestone';
  ring: OrbitRing;
  daysUntilDue: number;
  angle: number;
  size: number;
  color: string;
  status: string;
  clientName?: string;
  projectId?: string;
  isOverdue: boolean;
  priority?: 'high' | 'medium' | 'low';
}

// Ring configurations
const RING_CONFIG: Record<OrbitRing, { radius: number; label: string; days: [number, number] }> = {
  today: { radius: 80, label: 'Today', days: [0, 0] },
  week: { radius: 160, label: 'This Week', days: [1, 7] },
  month: { radius: 240, label: 'This Month', days: [8, 30] },
  quarter: { radius: 320, label: 'This Quarter', days: [31, 90] },
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.Planning]: '#3B82F6',
  [ProjectStatus.InProgress]: '#10B981',
  [ProjectStatus.Active]: '#059669',
  [ProjectStatus.OnHold]: '#F59E0B',
  [ProjectStatus.Completed]: '#8B5CF6',
  [ProjectStatus.Cancelled]: '#6B7280',
};

const PRIORITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

export const ProjectOrbitCalendar: React.FC<ProjectOrbitCalendarProps> = ({
  projects,
  clients,
  onSelectProject,
  onSelectTask,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('projects');
  const [zoom, setZoom] = useState(1);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedRing, setSelectedRing] = useState<OrbitRing | null>(null);
  const [showConstellations, setShowConstellations] = useState(true);
  const [centerDate, setCenterDate] = useState(new Date());
  const isDark = useDarkMode();

  const getClientName = useCallback((clientId: string) =>
    clients.find(c => c.id === clientId)?.name || 'Unknown', [clients]);

  // Calculate days until a date
  const getDaysUntil = useCallback((dateStr: string): number => {
    const date = new Date(dateStr);
    const today = new Date(centerDate);
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [centerDate]);

  // Determine which ring an item belongs to
  const getRing = useCallback((daysUntil: number): OrbitRing | null => {
    if (daysUntil <= 0) return 'today';
    if (daysUntil <= 7) return 'week';
    if (daysUntil <= 30) return 'month';
    if (daysUntil <= 90) return 'quarter';
    return null;
  }, []);

  // Generate orbit items from projects/tasks
  const orbitItems = useMemo((): OrbitItem[] => {
    const items: OrbitItem[] = [];
    const activeProjects = projects.filter(p => !p.archived && p.status !== ProjectStatus.Cancelled);

    if (viewMode === 'projects' || viewMode === 'milestones') {
      activeProjects.forEach((project, idx) => {
        const daysUntil = getDaysUntil(project.endDate);
        const ring = getRing(daysUntil);

        if (ring) {
          items.push({
            id: project.id,
            name: project.name,
            type: 'project',
            ring,
            daysUntilDue: daysUntil,
            angle: 0, // Will be calculated
            size: Math.min(60, Math.max(30, (project.budget || 10000) / 1000)),
            color: STATUS_COLORS[project.status] || '#6B7280',
            status: project.status,
            clientName: getClientName(project.clientId),
            isOverdue: daysUntil < 0,
            priority: project.priority as 'high' | 'medium' | 'low' | undefined,
          });
        }
      });
    }

    if (viewMode === 'tasks' || viewMode === 'milestones') {
      activeProjects.forEach(project => {
        project.tasks
          .filter(task => !task.completed && task.dueDate)
          .forEach(task => {
            const daysUntil = getDaysUntil(task.dueDate!);
            const ring = getRing(daysUntil);

            if (ring) {
              items.push({
                id: task.id,
                name: task.description,
                type: 'task',
                ring,
                daysUntilDue: daysUntil,
                angle: 0,
                size: 20,
                color: task.priority === 'high' ? PRIORITY_COLORS.high :
                       task.priority === 'medium' ? PRIORITY_COLORS.medium : PRIORITY_COLORS.low,
                status: task.completed ? 'completed' : 'pending',
                projectId: project.id,
                clientName: getClientName(project.clientId),
                isOverdue: daysUntil < 0,
                priority: task.priority as 'high' | 'medium' | 'low' | undefined,
              });
            }
          });
      });
    }

    // Distribute items around each ring
    const ringGroups: Record<OrbitRing, OrbitItem[]> = {
      today: [],
      week: [],
      month: [],
      quarter: [],
    };

    items.forEach(item => ringGroups[item.ring].push(item));

    // Sort by days until due and assign angles
    Object.keys(ringGroups).forEach(ring => {
      const ringItems = ringGroups[ring as OrbitRing];
      ringItems.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

      const angleStep = 360 / Math.max(ringItems.length, 1);
      const startAngle = -90; // Start from top

      ringItems.forEach((item, idx) => {
        item.angle = startAngle + (idx * angleStep);
      });
    });

    return items;
  }, [projects, viewMode, getDaysUntil, getRing, getClientName]);

  // Get items for a specific ring
  const getItemsForRing = useCallback((ring: OrbitRing) =>
    orbitItems.filter(item => item.ring === ring), [orbitItems]);

  // Ring counts for summary
  const ringCounts = useMemo(() => ({
    today: getItemsForRing('today').length,
    week: getItemsForRing('week').length,
    month: getItemsForRing('month').length,
    quarter: getItemsForRing('quarter').length,
  }), [getItemsForRing]);

  // Calculate position on ring
  const getPosition = useCallback((radius: number, angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: Math.cos(angleRad) * radius,
      y: Math.sin(angleRad) * radius,
    };
  }, []);

  // Navigate time
  const navigateTime = (direction: 'prev' | 'next') => {
    const newDate = new Date(centerDate);
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    setCenterDate(newDate);
  };

  const goToToday = () => setCenterDate(new Date());

  // Render a single orbit item
  const renderOrbitItem = (item: OrbitItem) => {
    const ringConfig = RING_CONFIG[item.ring];
    const pos = getPosition(ringConfig.radius * zoom, item.angle);
    const isHovered = hoveredItem === item.id;
    const isFiltered = selectedRing && selectedRing !== item.ring;

    return (
      <g
        key={item.id}
        transform={`translate(${pos.x}, ${pos.y})`}
        className="cursor-pointer transition-all duration-300"
        style={{
          opacity: isFiltered ? 0.2 : 1,
          filter: isHovered
            ? isDark
              ? 'drop-shadow(0 0 12px rgba(255,255,255,0.5))'
              : 'drop-shadow(0 0 12px rgba(0,0,0,0.3))'
            : 'none',
        }}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => {
          if (item.type === 'project') {
            onSelectProject(item.id);
          } else if (item.type === 'task' && item.projectId && onSelectTask) {
            const project = projects.find(p => p.id === item.projectId);
            const task = project?.tasks.find(t => t.id === item.id);
            if (task) onSelectTask(task, item.projectId);
          }
        }}
      >
        {/* Glow effect for overdue */}
        {item.isOverdue && (
          <circle
            r={item.size * zoom + 8}
            fill="none"
            stroke="#EF4444"
            strokeWidth={2}
            className="animate-pulse"
            opacity={0.6}
          />
        )}

        {/* Main circle */}
        <circle
          r={item.size * zoom}
          fill={item.color}
          stroke={isHovered
            ? (isDark ? '#FFFFFF' : '#1E293B')
            : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)')}
          strokeWidth={isHovered ? 3 : 1}
          className="transition-all duration-200"
        />

        {/* Priority indicator */}
        {item.priority === 'high' && (
          <circle
            r={4 * zoom}
            cx={item.size * zoom * 0.7}
            cy={-item.size * zoom * 0.7}
            fill="#EF4444"
            stroke={isDark ? '#FFFFFF' : '#1E293B'}
            strokeWidth={1}
          />
        )}

        {/* Hover tooltip */}
        {isHovered && (
          <g transform={`translate(${item.size * zoom + 10}, -20)`}>
            <rect
              x={0}
              y={0}
              width={180}
              height={60}
              rx={8}
              fill={isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
              stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            />
            <text x={10} y={20} fill={isDark ? '#FFFFFF' : '#0F172A'} fontSize={12} fontWeight="bold">
              {item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}
            </text>
            <text x={10} y={38} fill={isDark ? '#94A3B8' : '#64748B'} fontSize={10}>
              {item.clientName}
            </text>
            <text x={10} y={52} fill={item.isOverdue ? '#EF4444' : '#10B981'} fontSize={10}>
              {item.isOverdue
                ? `${Math.abs(item.daysUntilDue)} days overdue`
                : item.daysUntilDue === 0
                  ? 'Due today'
                  : `${item.daysUntilDue} days remaining`}
            </text>
          </g>
        )}
      </g>
    );
  };

  // Render constellation lines (connecting related projects)
  const renderConstellations = () => {
    if (!showConstellations) return null;

    const lines: React.ReactElement[] = [];
    const projectItems = orbitItems.filter(item => item.type === 'project');

    // Group by client
    const clientGroups: Record<string, OrbitItem[]> = {};
    projectItems.forEach(item => {
      const client = item.clientName || 'Unknown';
      if (!clientGroups[client]) clientGroups[client] = [];
      clientGroups[client].push(item);
    });

    // Draw lines between projects of same client
    Object.entries(clientGroups).forEach(([client, items]) => {
      if (items.length < 2) return;

      for (let i = 0; i < items.length - 1; i++) {
        const from = items[i];
        const to = items[i + 1];
        const fromPos = getPosition(RING_CONFIG[from.ring].radius * zoom, from.angle);
        const toPos = getPosition(RING_CONFIG[to.ring].radius * zoom, to.angle);

        lines.push(
          <line
            key={`${from.id}-${to.id}`}
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke="rgba(99, 102, 241, 0.3)"
            strokeWidth={1}
            strokeDasharray="4 4"
            className="pointer-events-none"
          />
        );
      }
    });

    return <g>{lines}</g>;
  };

  const svgSize = 800 * zoom;
  const center = svgSize / 2;

  return (
    <div className="bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden">
      {/* Header Controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            Orbit Calendar
          </h3>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5">
            {(['projects', 'tasks', 'milestones'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                  viewMode === mode
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateTime('prev')}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
            >
              Today
            </button>
            <button
              onClick={() => navigateTime('next')}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-700 pl-3">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
            >
              <ZoomOutIcon className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
            >
              <ZoomInIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Constellation Toggle */}
          <button
            onClick={() => setShowConstellations(!showConstellations)}
            className={`p-2 rounded-lg transition-colors ${
              showConstellations
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Toggle constellation lines"
          >
            <StarIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Ring Filter Pills */}
      <div className="px-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
        <span className="text-xs text-slate-500 mr-2">Filter by ring:</span>
        {(Object.keys(RING_CONFIG) as OrbitRing[]).map(ring => (
          <button
            key={ring}
            onClick={() => setSelectedRing(selectedRing === ring ? null : ring)}
            className={`px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1.5 ${
              selectedRing === ring
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-400 dark:hover:bg-slate-600'
            }`}
          >
            <span>{RING_CONFIG[ring].label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              selectedRing === ring ? 'bg-cyan-500' : 'bg-slate-400 dark:bg-slate-600'
            }`}>
              {ringCounts[ring]}
            </span>
          </button>
        ))}
      </div>

      {/* Main Orbit View */}
      <div className="relative overflow-auto" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="mx-auto"
          style={{
            background: isDark
              ? 'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)'
              : 'radial-gradient(circle at center, #E2E8F0 0%, #CBD5E1 100%)'
          }}
        >
          {/* Background stars (dark mode) / dots (light mode) */}
          {Array.from({ length: 50 }).map((_, i) => (
            <circle
              key={`star-${i}`}
              cx={Math.random() * svgSize}
              cy={Math.random() * svgSize}
              r={Math.random() * 1.5}
              fill={isDark ? 'white' : '#94A3B8'}
              opacity={isDark ? Math.random() * 0.5 + 0.2 : Math.random() * 0.3 + 0.1}
            />
          ))}

          <g transform={`translate(${center}, ${center})`}>
            {/* Orbit Rings */}
            {(Object.keys(RING_CONFIG) as OrbitRing[]).map(ring => {
              const config = RING_CONFIG[ring];
              const isSelected = selectedRing === ring;

              return (
                <g key={ring}>
                  {/* Ring circle */}
                  <circle
                    r={config.radius * zoom}
                    fill="none"
                    stroke={isSelected
                      ? 'rgba(6, 182, 212, 0.4)'
                      : isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.25)'}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray={ring === 'today' ? 'none' : '4 4'}
                  />

                  {/* Ring label */}
                  <text
                    x={0}
                    y={-config.radius * zoom - 8}
                    textAnchor="middle"
                    fill={isSelected ? '#06B6D4' : isDark ? '#64748B' : '#475569'}
                    fontSize={11}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {config.label}
                  </text>
                </g>
              );
            })}

            {/* Center "NOW" indicator */}
            <g>
              <circle
                r={40 * zoom}
                fill={isDark ? 'url(#centerGradientDark)' : 'url(#centerGradientLight)'}
                className="animate-pulse"
              />
              <circle
                r={40 * zoom}
                fill="none"
                stroke="rgba(6, 182, 212, 0.5)"
                strokeWidth={2}
              />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isDark ? 'white' : '#0F172A'}
                fontSize={14}
                fontWeight="bold"
              >
                NOW
              </text>
              <text
                y={18}
                textAnchor="middle"
                fill={isDark ? '#94A3B8' : '#475569'}
                fontSize={10}
              >
                {centerDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            </g>

            {/* Constellation lines */}
            {renderConstellations()}

            {/* Orbit items */}
            {orbitItems.map(renderOrbitItem)}

            {/* Gradient definitions */}
            <defs>
              <radialGradient id="centerGradientDark" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.8" />
              </radialGradient>
              <radialGradient id="centerGradientLight" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.9" />
              </radialGradient>
            </defs>
          </g>
        </svg>

        {/* Floating Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Status Legend</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(STATUS_COLORS).slice(0, 4).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-slate-600 dark:text-slate-300">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Quick Stats</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-red-500 dark:text-red-400">Overdue</span>
              <span className="text-xs text-slate-900 dark:text-white font-medium">
                {orbitItems.filter(i => i.isOverdue).length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-amber-500 dark:text-yellow-400">Due Today</span>
              <span className="text-xs text-slate-900 dark:text-white font-medium">
                {orbitItems.filter(i => i.daysUntilDue === 0).length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-cyan-600 dark:text-cyan-400">This Week</span>
              <span className="text-xs text-slate-900 dark:text-white font-medium">{ringCounts.week}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOrbitCalendar;
