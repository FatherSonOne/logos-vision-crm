import React, { useState, useMemo } from 'react';
import { Project, Client, ProjectStatus } from '../types';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, FilterIcon, GridIcon, ListIcon } from './icons';

interface ProjectCalendarProps {
  projects: Project[];
  clients: Client[];
  onNavigateToProject: (projectId: string) => void;
}

type ViewMode = 'month' | 'quarter' | 'year';

export const ProjectCalendar: React.FC<ProjectCalendarProps> = ({
  projects,
  clients,
  onNavigateToProject
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('quarter');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<'all' | ProjectStatus>('all');
  const [filterClient, setFilterClient] = useState<string>('all');

  // Get status color
  const getStatusColor = (status: ProjectStatus): string => {
    switch (status) {
      case ProjectStatus.Active:
        return 'bg-green-500';
      case ProjectStatus.Planning:
        return 'bg-blue-500';
      case ProjectStatus.Completed:
        return 'bg-gray-400';
      case ProjectStatus.OnHold:
        return 'bg-yellow-500';
      case ProjectStatus.Cancelled:
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Get client name
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown';
  };

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (viewMode) {
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
      case 'quarter':
        const quarterStart = Math.floor(start.getMonth() / 3) * 3;
        start.setMonth(quarterStart);
        start.setDate(1);
        end.setMonth(quarterStart + 3);
        end.setDate(0);
        break;
      case 'year':
        start.setMonth(0);
        start.setDate(1);
        end.setMonth(11);
        end.setDate(31);
        break;
    }

    return { start, end };
  }, [currentDate, viewMode]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(p => !p.archived);

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    if (filterClient !== 'all') {
      filtered = filtered.filter(p => p.clientId === filterClient);
    }

    // Only show projects that overlap with the current date range
    filtered = filtered.filter(p => {
      const projectStart = new Date(p.startDate);
      const projectEnd = new Date(p.endDate);
      return projectStart <= dateRange.end && projectEnd >= dateRange.start;
    });

    return filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [projects, filterStatus, filterClient, dateRange]);

  // Generate time columns
  const timeColumns = useMemo(() => {
    const columns: Date[] = [];
    const current = new Date(dateRange.start);

    while (current <= dateRange.end) {
      columns.push(new Date(current));
      
      switch (viewMode) {
        case 'month':
          current.setDate(current.getDate() + 1);
          break;
        case 'quarter':
          current.setDate(current.getDate() + 7); // Weekly
          break;
        case 'year':
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }

    return columns;
  }, [dateRange, viewMode]);

  // Calculate project bar position and width
  const getProjectBarStyle = (project: Project) => {
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);
    
    // Clamp to visible range
    const visibleStart = projectStart < dateRange.start ? dateRange.start : projectStart;
    const visibleEnd = projectEnd > dateRange.end ? dateRange.end : projectEnd;

    const totalDays = (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24);
    const startOffset = (visibleStart.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24);
    const duration = (visibleEnd.getTime() - visibleStart.getTime()) / (1000 * 60 * 60 * 24);

    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return {
      left: `${left}%`,
      width: `${Math.max(width, 1)}%` // Minimum 1%
    };
  };

  // Navigation
  const navigateTime = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format date for display
  const formatDateRange = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    switch (viewMode) {
      case 'month':
        return `${monthNames[dateRange.start.getMonth()]} ${dateRange.start.getFullYear()}`;
      case 'quarter':
        const quarter = Math.floor(dateRange.start.getMonth() / 3) + 1;
        return `Q${quarter} ${dateRange.start.getFullYear()}`;
      case 'year':
        return `${dateRange.start.getFullYear()}`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTime('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeftIcon />
            </button>
            
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[140px] text-center">
                {formatDateRange()}
              </span>
            </div>

            <button
              onClick={() => navigateTime('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRightIcon />
            </button>

            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
            >
              Today
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('quarter')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === 'quarter'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Quarter
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                viewMode === 'year'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value={ProjectStatus.Active}>Active</option>
            <option value={ProjectStatus.Planning}>Planning</option>
            <option value={ProjectStatus.Completed}>Completed</option>
            <option value={ProjectStatus.OnHold}>On Hold</option>
          </select>

          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>

          <div className="ml-auto text-sm text-gray-600 dark:text-gray-400 flex items-center">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Time Header */}
          <div className="grid grid-cols-12 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="col-span-3 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Project
            </div>
            <div className="col-span-9 grid" style={{ gridTemplateColumns: `repeat(${timeColumns.length}, 1fr)` }}>
              {timeColumns.map((date, idx) => (
                <div
                  key={idx}
                  className="px-2 py-2 text-xs text-center text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700"
                >
                  {viewMode === 'month' && date.getDate()}
                  {viewMode === 'quarter' && `${date.getDate()}/${date.getMonth() + 1}`}
                  {viewMode === 'year' && ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][date.getMonth()]}
                </div>
              ))}
            </div>
          </div>

          {/* Project Rows */}
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              No projects in this time range
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProjects.map(project => (
                <div
                  key={project.id}
                  className="grid grid-cols-12 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Project Name */}
                  <div className="col-span-3 px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {project.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {getClientName(project.clientId)}
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="col-span-9 relative py-3 px-2">
                    <div className="relative h-8">
                      <button
                        onClick={() => onNavigateToProject(project.id)}
                        className="absolute h-full rounded group"
                        style={getProjectBarStyle(project)}
                      >
                        <div className={`h-full rounded ${getStatusColor(project.status)} opacity-80 group-hover:opacity-100 transition-opacity relative overflow-hidden`}>
                          {/* Progress indicator */}
                          <div
                            className="absolute top-0 left-0 h-full bg-white/20"
                            style={{ width: '50%' }} // You can calculate actual progress here
                          />
                          
                          {/* Project name on bar (if wide enough) */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-white px-2 truncate">
                              {project.name}
                            </span>
                          </div>
                        </div>

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                            <div className="font-medium">{project.name}</div>
                            <div className="text-gray-300 dark:text-gray-400">
                              {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                            </div>
                            <div className="text-gray-300 dark:text-gray-400">
                              Status: {project.status}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-6 text-xs">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Legend:</span>
          {[
            { status: ProjectStatus.Active, label: 'Active' },
            { status: ProjectStatus.Planning, label: 'Planning' },
            { status: ProjectStatus.OnHold, label: 'On Hold' },
            { status: ProjectStatus.Completed, label: 'Completed' }
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${getStatusColor(status)}`} />
              <span className="text-gray-600 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};