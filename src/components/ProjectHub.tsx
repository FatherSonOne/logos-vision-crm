import React, { useState, useMemo } from 'react';
import { Project, Task, Client, Activity, ProjectStatus } from '../types';
import { FolderIcon, PlusIcon, SearchIcon, FilterIcon, GridIcon, ListIcon, TrendingUpIcon, AlertCircleIcon, CheckCircleIcon, ClockIcon, UsersIcon, DollarSignIcon, StarIcon, PinIcon, DownloadIcon, TemplateIcon, CheckboxIcon, ArchiveBoxIcon, EyeIcon, CopyIcon, EditIcon, CalendarIcon } from './icons';
import { ProjectTemplates } from './ProjectTemplates';
import { ContextMenu, useContextMenu, ContextMenuItem } from './ContextMenu';
import { ProjectCalendar } from './ProjectCalendar';

interface ProjectHubProps {
  projects: Project[];
  tasks: Task[];
  clients: Client[];
  activities: Activity[];
  onNavigateToProject: (projectId: string) => void;
  onNavigateToPage?: (page: string) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
}

type ViewMode = 'grid' | 'list' | 'calendar';
type FilterStatus = 'all' | ProjectStatus;

export const ProjectHub: React.FC<ProjectHubProps> = ({
  projects,
  tasks,
  clients,
  activities,
  onNavigateToProject,
  onNavigateToPage,
  onUpdateProject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<'name' | 'dueDate' | 'status' | 'budget'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [filterClient, setFilterClient] = useState<string>('all');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  // Calculate project statistics
  const projectStats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === ProjectStatus.Active && !p.archived).length;
    const plannedProjects = projects.filter(p => p.status === ProjectStatus.Planning && !p.archived).length;
    const completedProjects = projects.filter(p => p.status === ProjectStatus.Completed && !p.archived).length;
    const onHoldProjects = projects.filter(p => p.status === ProjectStatus.OnHold && !p.archived).length;
    
    const totalBudget = projects.filter(p => !p.archived).reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pinnedCount = projects.filter(p => p.pinned && !p.archived).length;
    
    return {
      total: projects.filter(p => !p.archived).length,
      active: activeProjects,
      planned: plannedProjects,
      completed: completedProjects,
      onHold: onHoldProjects,
      totalBudget,
      totalTasks,
      completedTasks,
      taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      pinnedCount
    };
  }, [projects, tasks]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(p => !p.archived);

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Apply client filter
    if (filterClient !== 'all') {
      filtered = filtered.filter(p => p.clientId === filterClient);
    }

    // Apply pinned filter
    if (showPinnedOnly) {
      filtered = filtered.filter(p => p.pinned);
    }

    // Apply starred filter
    if (showStarredOnly) {
      filtered = filtered.filter(p => p.starred);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      // Pinned projects always come first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'dueDate':
          if (!a.endDate) return 1;
          if (!b.endDate) return -1;
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'budget':
          return (b.budget || 0) - (a.budget || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchTerm, filterStatus, filterClient, showPinnedOnly, showStarredOnly, sortBy]);

  // Get status badge color
  const getStatusColor = (status: ProjectStatus): string => {
    switch (status) {
      case ProjectStatus.Active:
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700';
      case ProjectStatus.Planning:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700';
      case ProjectStatus.Completed:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600';
      case ProjectStatus.OnHold:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700';
      case ProjectStatus.Cancelled:
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:border-gray-600';
    }
  };

  // Get client name by ID
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  // Calculate project progress
  const getProjectProgress = (projectId: string): number => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  // Toggle project selection
  const toggleProjectSelection = (projectId: string) => {
    const newSelection = new Set(selectedProjects);
    if (newSelection.has(projectId)) {
      newSelection.delete(projectId);
    } else {
      newSelection.add(projectId);
    }
    setSelectedProjects(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  // Select all visible projects
  const selectAllProjects = () => {
    const allIds = new Set(filteredProjects.map(p => p.id));
    setSelectedProjects(allIds);
    setShowBulkActions(allIds.size > 0);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedProjects(new Set());
    setShowBulkActions(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const projectsToExport = filteredProjects.filter(p => 
      selectedProjects.size > 0 ? selectedProjects.has(p.id) : true
    );

    const headers = ['Name', 'Client', 'Status', 'Start Date', 'End Date', 'Budget', 'Progress', 'Tasks', 'Team Size'];
    const rows = projectsToExport.map(p => [
      p.name,
      getClientName(p.clientId),
      p.status,
      p.startDate,
      p.endDate,
      p.budget || 0,
      `${getProjectProgress(p.id)}%`,
      tasks.filter(t => t.projectId === p.id).length,
      p.teamMemberIds.length
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle template selection
  const handleTemplateSelect = (template: any) => {
    setShowTemplates(false);
    // You can add logic here to create a project from the template
    // For now, we'll just navigate to the projects page
    onNavigateToPage?.('projects');
  };

  // Context menu handlers
  const handlePinProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && onUpdateProject) {
      onUpdateProject(projectId, { pinned: !project.pinned });
    }
  };

  const handleStarProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && onUpdateProject) {
      onUpdateProject(projectId, { starred: !project.starred });
    }
  };

  const handleArchiveProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && onUpdateProject) {
      onUpdateProject(projectId, { archived: !project.archived });
    }
  };

  const handleMarkAsTemplate = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && onUpdateProject) {
      onUpdateProject(projectId, { 
        isTemplate: true,
        templateName: project.name 
      });
    }
  };

  const handleDuplicateProject = (projectId: string) => {
    // In a real implementation, you'd create a copy of the project
    console.log('Duplicate project:', projectId);
    // onNavigateToPage?.('projects');
  };

  const handleExportSingleProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const headers = ['Name', 'Client', 'Status', 'Start Date', 'End Date', 'Budget', 'Progress', 'Tasks', 'Team Size'];
      const row = [
        project.name,
        getClientName(project.clientId),
        project.status,
        project.startDate,
        project.endDate,
        project.budget || 0,
        `${getProjectProgress(project.id)}%`,
        tasks.filter(t => t.projectId === project.id).length,
        project.teamMemberIds.length
      ];

      const csvContent = [
        headers.join(','),
        row.map(cell => `"${cell}"`).join(',')
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${project.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const getContextMenuItems = (project: Project): ContextMenuItem[] => {
    return [
      {
        label: 'View Details',
        icon: <EyeIcon />,
        onClick: () => onNavigateToProject(project.id),
        shortcut: '↵'
      },
      {
        separator: true
      },
      {
        label: project.pinned ? 'Unpin' : 'Pin to Top',
        icon: <PinIcon className="w-4 h-4" filled={project.pinned} />,
        onClick: () => handlePinProject(project.id),
        shortcut: 'P'
      },
      {
        label: project.starred ? 'Remove Star' : 'Add Star',
        icon: <StarIcon className="w-4 h-4" filled={project.starred} />,
        onClick: () => handleStarProject(project.id),
        shortcut: 'S'
      },
      {
        separator: true
      },
      {
        label: 'Duplicate Project',
        icon: <CopyIcon />,
        onClick: () => handleDuplicateProject(project.id)
      },
      {
        label: 'Save as Template',
        icon: <TemplateIcon className="w-4 h-4" />,
        onClick: () => handleMarkAsTemplate(project.id),
        disabled: project.isTemplate
      },
      {
        label: 'Export to CSV',
        icon: <DownloadIcon />,
        onClick: () => handleExportSingleProject(project.id)
      },
      {
        separator: true
      },
      {
        label: project.archived ? 'Restore' : 'Archive',
        icon: <ArchiveBoxIcon className="w-4 h-4" />,
        onClick: () => handleArchiveProject(project.id)
      }
    ];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={hideContextMenu}
        />
      )}

      {/* Template Modal */}
      {showTemplates && (
        <ProjectTemplates
          onClose={() => setShowTemplates(false)}
          onSelectTemplate={handleTemplateSelect}
          existingProjects={projects}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FolderIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Project Hub
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage and monitor all your projects in one place
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            <TemplateIcon className="w-4 h-4" />
            Browse Templates
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <DownloadIcon />
            Export
          </button>
          <button
            onClick={() => onNavigateToPage?.('projects')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setShowPinnedOnly(!showPinnedOnly)}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg text-white p-6 cursor-pointer transform hover:scale-105 transition-transform"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/80 text-sm font-medium">Total Projects</div>
              <div className="text-3xl font-bold mt-1">{projectStats.total}</div>
              {projectStats.pinnedCount > 0 && (
                <div className="text-white/80 text-xs mt-1 flex items-center gap-1">
                  <PinIcon className="w-3 h-3" filled />
                  {projectStats.pinnedCount} pinned
                </div>
              )}
            </div>
            <FolderIcon className="w-12 h-12 text-white/30" />
          </div>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === ProjectStatus.Active ? 'all' : ProjectStatus.Active)}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg text-white p-6 cursor-pointer transform hover:scale-105 transition-transform"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/80 text-sm font-medium">Active Projects</div>
              <div className="text-3xl font-bold mt-1">{projectStats.active}</div>
              <div className="text-white/80 text-xs mt-1">
                {projectStats.planned} in planning
              </div>
            </div>
            <TrendingUpIcon className="w-12 h-12 text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg text-white p-6 cursor-pointer transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/80 text-sm font-medium">Total Budget</div>
              <div className="text-3xl font-bold mt-1">
                ${projectStats.totalBudget.toLocaleString()}
              </div>
              <div className="text-white/80 text-xs mt-1">
                Avg: ${Math.round(projectStats.totalBudget / Math.max(projectStats.total, 1)).toLocaleString()}
              </div>
            </div>
            <DollarSignIcon className="w-12 h-12 text-white/30" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg text-white p-6 cursor-pointer transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/80 text-sm font-medium">Task Completion</div>
              <div className="text-3xl font-bold mt-1">{projectStats.taskCompletionRate}%</div>
              <div className="text-white/80 text-xs mt-1">
                {projectStats.completedTasks} of {projectStats.totalTasks} tasks
              </div>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-white/30" />
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
              {selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear selection
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            >
              <DownloadIcon />
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                showPinnedOnly
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <PinIcon className="w-4 h-4" filled={showPinnedOnly} />
              Pinned
            </button>
            
            <button
              onClick={() => setShowStarredOnly(!showStarredOnly)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                showStarredOnly
                  ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <StarIcon className="w-4 h-4" filled={showStarredOnly} />
              Starred
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <FilterIcon className="w-4 h-4" />
              {showFilters ? 'Hide' : 'More'} Filters
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
              title="Grid View"
            >
              <GridIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
              title="List View"
            >
              <ListIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}
              title="Calendar View"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value={ProjectStatus.Active}>Active</option>
                <option value={ProjectStatus.Planning}>Planning</option>
                <option value={ProjectStatus.Completed}>Completed</option>
                <option value={ProjectStatus.OnHold}>On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client
              </label>
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="name">Name</option>
                <option value="dueDate">Due Date</option>
                <option value="status">Status</option>
                <option value="budget">Budget</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Selection Bar */}
      {viewMode === 'grid' && filteredProjects.length > 0 && (
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={selectAllProjects}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Select all {filteredProjects.length}
          </button>
          {selectedProjects.size > 0 && (
            <button
              onClick={clearSelection}
              className="text-gray-600 dark:text-gray-400 hover:underline"
            >
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Projects Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm ? 'Try adjusting your search or filters' : 'Get started by creating your first project'}
          </p>
          <button
            onClick={() => onNavigateToPage?.('projects')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      ) : viewMode === 'calendar' ? (
        <ProjectCalendar
          projects={filteredProjects}
          clients={clients}
          onNavigateToProject={onNavigateToProject}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => {
            const progress = getProjectProgress(project.id);
            const projectTaskCount = tasks.filter(t => t.projectId === project.id).length;
            const isSelected = selectedProjects.has(project.id);
            
            return (
              <div
                key={project.id}
                onContextMenu={(e) => showContextMenu(e, getContextMenuItems(project))}
                className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-300 ease-out relative group hover:scale-[1.02] hover:-translate-y-1 ${
                  isSelected
                    ? 'border-indigo-500 dark:border-indigo-400 shadow-xl shadow-indigo-500/20'
                    : 'border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:border-indigo-300 dark:hover:border-indigo-600'
                } animate-in fade-in slide-in-from-bottom-4 duration-500`}
                style={{ animationDelay: `${filteredProjects.indexOf(project) * 50}ms` }}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProjectSelection(project.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <CheckboxIcon checked={isSelected} className="w-5 h-5" />
                  </button>
                </div>

                {/* Pin/Star Icons */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  {project.pinned && (
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-full animate-pulse">
                      <PinIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" filled />
                    </div>
                  )}
                  {project.starred && (
                    <div className="bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded-full animate-pulse">
                      <StarIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" filled />
                    </div>
                  )}
                </div>

                <div
                  onClick={() => onNavigateToProject(project.id)}
                  className="p-6 pt-12 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {getClientName(project.clientId)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 hover:scale-105 ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-500 dark:to-indigo-400 h-2 rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${progress}%` }}
                      >
                        {/* Animated shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{projectTaskCount} tasks</span>
                    </div>
                    {project.endDate && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{new Date(project.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {project.budget && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Budget</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${project.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <CheckboxIcon
                    checked={selectedProjects.size === filteredProjects.length && filteredProjects.length > 0}
                    className="w-5 h-5 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Budget
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProjects.map(project => {
                const progress = getProjectProgress(project.id);
                const isSelected = selectedProjects.has(project.id);
                
                return (
                  <tr
                    key={project.id}
                    onContextMenu={(e) => showContextMenu(e, getContextMenuItems(project))}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <CheckboxIcon
                        checked={isSelected}
                        className="w-5 h-5 cursor-pointer"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          toggleProjectSelection(project.id);
                        }}
                      />
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => onNavigateToProject(project.id)}
                    >
                      <div className="flex items-center gap-2">
                        {project.pinned && <PinIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" filled />}
                        {project.starred && <StarIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" filled />}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {project.name}
                          </div>
                          {project.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {project.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {getClientName(project.clientId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[3rem] text-right">
                          {progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {project.budget ? `$${project.budget.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};