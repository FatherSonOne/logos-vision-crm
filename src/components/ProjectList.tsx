import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Project, Client, TeamMember, Task } from '../types';
import { ProjectStatus, TaskStatus, Permission } from '../types';
import { ProjectTimeline } from './ProjectTimeline';
import { getDeadlineStatus } from '../utils/dateHelpers';
import { StatusBadge } from './ui/StatusBadge';
import { ClockIcon, BriefcaseIcon, PlusIcon, EditIcon, TrashIcon, CopyIcon, EyeIcon, ShareIcon, DownloadIcon, StarIcon, PinIcon, CollaborateIcon, SortIcon, SearchIcon, ChevronDownIcon, CheckboxIcon, XMarkIcon, ArchiveBoxIcon } from './icons';
import { EmptyState } from './ui/EmptyState';
import { AdvancedFilterPanel, FilterConfig, FilterGroup, SavedFilter } from './filters/AdvancedFilterPanel';
import { applyFilterLogic } from './filters/filterLogic';
import { ExportButton, ExportDialog, ExportField } from './export/ExportButton';
import { Skeleton } from './ui/Skeleton';
import { ContextMenu, ContextMenuItem } from './ui/ContextMenu';
import { projectNotesService, projectActivitiesService } from '../services/projectNotesService';
import { usePagination, Pagination } from './ui/Pagination';
import { ProtectedComponent } from './ProtectedComponent';
import { usePermissions } from '../contexts/PermissionContext';

// Phase 3 imports
import { 
  PinnedProjects, 
  ProjectTemplates, 
  ProjectComparison, 
  ProjectCollaboration,
  type ProjectNote,
  type ProjectActivityItem 
} from './projects';


interface ProjectListProps {
  projects: Project[];
  clients: Client[];
  teamMembers?: TeamMember[];
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  onEditProject?: (id: string) => void;
  onDeleteProject?: (id: string) => void;
  onDuplicateProject?: (project: Project) => void;
  onUpdateProject?: (project: Project) => void;
  onCreateFromTemplate?: (project: Partial<Project>) => void;
  onBackToHub?: () => void;
  filterLabel?: string;
}

const ProjectCardSkeleton: React.FC = () => (
    <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-lg border border-white/20 shadow-lg flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-1/3 mb-3" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        
        <div className="flex justify-between items-center text-sm mb-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
        </div>

        <div className="mb-2 mt-auto">
            <div className="flex justify-between text-xs mb-1">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-3 w-1/6" />
            </div>
            <Skeleton className="h-2 w-full" />
        </div>
        
        <Skeleton className="h-10 w-full mt-4" />
    </div>
);

// Bulk Action Toolbar Component
const BulkActionToolbar: React.FC<{
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: ProjectStatus) => void;
  onBulkArchive: () => void;
  onCancel: () => void;
}> = ({ selectedCount, totalCount, onSelectAll, onDeselectAll, onBulkDelete, onBulkStatusChange, onBulkArchive, onCancel }) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-4">
        {/* Selection count */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-600">
          <CheckboxIcon checked={true} className="h-5 w-5" />
          <span className="font-semibold">{selectedCount} selected</span>
        </div>
        
        {/* Select all / Deselect all */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-600">
          {selectedCount < totalCount ? (
            <button
              onClick={onSelectAll}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Select all ({totalCount})
            </button>
          ) : (
            <button
              onClick={onDeselectAll}
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              Deselect all
            </button>
          )}
        </div>
        
        {/* Bulk actions */}
        <div className="flex items-center gap-2">
          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              Change Status
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            {showStatusDropdown && (
              <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden min-w-[160px]">
                {Object.values(ProjectStatus).map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      onBulkStatusChange(status);
                      setShowStatusDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors"
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Archive button */}
          <button
            onClick={onBulkArchive}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm transition-colors"
          >
            <ArchiveBoxIcon className="h-4 w-4" />
            Archive
          </button>
          
          {/* Delete button */}
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm transition-colors"
          >
            <TrashIcon />
            Delete
          </button>
        </div>
        
        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="ml-2 p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
          title="Cancel selection"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{ 
  project: Project; 
  clientName: string; 
  onSelectProject: (id: string) => void;
  onEditProject?: (id: string) => void;
  onDeleteProject?: (id: string) => void;
  onDuplicateProject?: (project: Project) => void;
  onTogglePin?: (projectId: string) => void;
  onToggleStar?: (projectId: string) => void;
  onToggleArchive?: (projectId: string) => void;
  onOpenCollaboration?: (project: Project) => void;
  onStatusChange?: (projectId: string, newStatus: ProjectStatus) => void;
  onQuickAddTask?: (projectId: string, taskDescription: string) => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggleSelect?: (projectId: string) => void;
}> = ({ project, clientName, onSelectProject, onEditProject, onDeleteProject, onDuplicateProject, onTogglePin, onToggleStar, onToggleArchive, onOpenCollaboration, onStatusChange, onQuickAddTask, isSelected = false, isSelectionMode = false, onToggleSelect }) => {
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [quickTaskText, setQuickTaskText] = useState('');
    
    const completionPercentage = project.tasks.length > 0
        ? (project.tasks.filter(t => t.status === 'Done').length / project.tasks.length) * 100
        : 0;
    
    const deadline = getDeadlineStatus(project.endDate, project.status === ProjectStatus.Completed);

    const handleQuickAddSubmit = () => {
      if (quickTaskText.trim() && onQuickAddTask) {
        onQuickAddTask(project.id, quickTaskText.trim());
        setQuickTaskText('');
        setShowQuickAdd(false);
      }
    };

    // Permission checks
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission(Permission.ProjectEdit);
    const canDelete = hasPermission(Permission.ProjectDelete);
    const canArchive = hasPermission(Permission.ProjectArchive);

    // Create context menu items
    const menuItems: ContextMenuItem[] = [
        {
            id: 'view',
            label: 'View Details',
            icon: <EyeIcon />,
            onClick: () => onSelectProject(project.id)
        },
        {
            id: 'edit',
            label: 'Edit Project',
            icon: <EditIcon />,
            onClick: () => onEditProject?.(project.id),
            disabled: !onEditProject || !canEdit,
            divider: true
        },
        {
            id: 'star',
            label: project.starred ? 'Remove from Favorites' : 'Add to Favorites',
            icon: <StarIcon filled={project.starred} />,
            onClick: () => onToggleStar?.(project.id),
        },
        {
            id: 'pin',
            label: project.pinned ? 'Unpin Project' : 'Pin Project',
            icon: <PinIcon filled={project.pinned} />,
            onClick: () => onTogglePin?.(project.id),
        },
        {
            id: 'collaborate',
            label: 'Collaborate',
            icon: <CollaborateIcon />,
            onClick: () => onOpenCollaboration?.(project),
            divider: true
        },
        {
            id: 'duplicate',
            label: 'Duplicate Project',
            icon: <CopyIcon />,
            onClick: () => onDuplicateProject?.(project),
            disabled: !onDuplicateProject
        },
        {
            id: 'archive',
            label: project.archived ? 'Unarchive Project' : 'Archive Project',
            icon: <ArchiveBoxIcon className="h-4 w-4" />,
            onClick: () => onToggleArchive?.(project.id),
            disabled: !canArchive,
        },
        {
            id: 'export',
            label: 'Export Project',
            icon: <DownloadIcon />,
            onClick: () => {
                const dataStr = JSON.stringify(project, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = `project-${project.name.replace(/\s+/g, '-').toLowerCase()}.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
            },
            divider: true
        },
        {
            id: 'delete',
            label: 'Delete Project',
            icon: <TrashIcon />,
            onClick: () => {
                if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
                    onDeleteProject?.(project.id);
                }
            },
            disabled: !onDeleteProject || !canDelete,
            danger: true
        }
    ];

    return (
        <ContextMenu items={menuItems}>
            <div 
              className={`backdrop-blur-xl p-6 rounded-lg border shadow-lg flex flex-col justify-between hover:border-white/40 transition-all duration-300 text-shadow-strong h-full cursor-pointer relative ${
                project.archived 
                  ? 'bg-slate-200/30 dark:bg-slate-800/40 opacity-75 border-amber-300/50 dark:border-amber-700/50' 
                  : 'bg-white/20 dark:bg-slate-900/40'
              } ${
                isSelected ? 'border-cyan-500 ring-2 ring-cyan-500/50 bg-cyan-50/10 dark:bg-cyan-900/20' : 'border-white/20'
              }`}
              onClick={(e) => {
                if (isSelectionMode && onToggleSelect) {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleSelect(project.id);
                }
              }}
            >
                {/* Selection checkbox */}
                {isSelectionMode && (
                  <div 
                    className="absolute top-3 left-3 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect?.(project.id);
                    }}
                  >
                    <CheckboxIcon checked={isSelected} className="h-6 w-6 cursor-pointer" />
                  </div>
                )}
                
                {/* Star/Pin/Archived indicators */}
                {(project.starred || project.pinned || project.archived) && (
                  <div className={`absolute top-2 flex gap-1 ${isSelectionMode ? 'right-2' : 'right-2'}`}>
                    {project.archived && (
                      <span className="text-amber-600 dark:text-amber-400" title="Archived">
                        <ArchiveBoxIcon className="h-4 w-4" />
                      </span>
                    )}
                    {project.starred && (
                      <span className="text-amber-500" title="Favorite">
                        <StarIcon filled className="h-4 w-4" />
                      </span>
                    )}
                    {project.pinned && (
                      <span className="text-primary-500" title="Pinned">
                        <PinIcon filled className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                )}

                <div className={isSelectionMode ? 'pl-6' : ''}>
                    <div className="flex justify-between items-start mb-2 pr-12">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{project.name}</h3>
                        {/* Quick Status Dropdown */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={project.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              onStatusChange?.(project.id, e.target.value as ProjectStatus);
                            }}
                            className={`text-xs font-semibold px-2 py-1 rounded-full cursor-pointer appearance-none pr-6 border-0 focus:ring-2 focus:ring-cyan-500 ${
                              project.status === ProjectStatus.Planning ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' :
                              project.status === ProjectStatus.InProgress ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                              project.status === ProjectStatus.Completed ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                              project.status === ProjectStatus.OnHold ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : 
                              'bg-slate-200 text-slate-700'
                            }`}
                            title="Click to change status"
                          >
                            {Object.values(ProjectStatus).map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <ChevronDownIcon className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                        </div>
                    </div>
                    <p className="text-sm text-cyan-800 font-medium mb-3 dark:text-cyan-300">{clientName}</p>
                    <p className="text-sm text-slate-700 line-clamp-2 mb-4 dark:text-slate-200">{project.description}</p>
                    
                    <div className="flex justify-between items-center text-sm mb-4">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Deadline</span>
                        <span className={`flex items-center gap-1 font-semibold ${deadline.color}`}>
                            <ClockIcon />
                            {deadline.text}
                        </span>
                    </div>

                    <div className="mb-2">
                        <div className="flex justify-between text-xs text-slate-600 mb-1 dark:text-slate-300">
                            <span>Progress</span>
                            <span>{Math.round(completionPercentage)}%</span>
                        </div>
                        <div className="w-full bg-slate-200/50 rounded-full h-2 dark:bg-black/20">
                            <div className="bg-gradient-to-r from-cyan-500 to-sky-500 h-2 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                        </div>
                    </div>
                    
                    {/* Quick Add Task */}
                    {showQuickAdd ? (
                      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={quickTaskText}
                            onChange={(e) => setQuickTaskText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleQuickAddSubmit();
                              if (e.key === 'Escape') {
                                setShowQuickAdd(false);
                                setQuickTaskText('');
                              }
                            }}
                            placeholder="Task description..."
                            className="flex-1 px-2 py-1.5 text-sm bg-white/50 dark:bg-black/30 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-800 dark:text-slate-100"
                            autoFocus
                          />
                          <button
                            onClick={handleQuickAddSubmit}
                            disabled={!quickTaskText.trim()}
                            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-400 text-white rounded-md text-sm font-medium transition-colors"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setShowQuickAdd(false);
                              setQuickTaskText('');
                            }}
                            className="px-2 py-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQuickAdd(true);
                        }}
                        className="mt-3 w-full text-left text-sm text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1"
                      >
                        <PlusIcon size="sm" /> Quick add task...
                      </button>
                    )}
                </div>
                
                <button
                    onClick={() => onSelectProject(project.id)}
                    className="mt-4 w-full text-center bg-gradient-to-b from-cyan-500 to-sky-600 text-white px-4 py-2 rounded-md text-sm font-semibold border border-cyan-700/50 hover:from-cyan-600 hover:to-sky-700 transition-all shadow-md btn-hover-scale"
                >
                    View Details
                </button>
            </div>
        </ContextMenu>
    );
};

export const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  clients, 
  teamMembers = [],
  onSelectProject, 
  onAddProject,
  onEditProject,
  onDeleteProject,
  onDuplicateProject,
  onUpdateProject,
  onCreateFromTemplate,
  onBackToHub,
  filterLabel
}) => {
  const [view, setView] = useState<'card' | 'timeline'>('card');
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterGroup | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status' | 'client' | 'progress'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showArchived, setShowArchived] = useState(false);
  
  // Bulk Selection state
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Phase 3 state
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);
  const [selectedProjectForCollab, setSelectedProjectForCollab] = useState<Project | null>(null);
  const [projectNotes, setProjectNotes] = useState<Record<string, ProjectNote[]>>({});
  const [projectActivities, setProjectActivities] = useState<Record<string, ProjectActivityItem[]>>({});
  
  // Sync localProjects with props
  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Phase 3 handlers
  const handleTogglePin = (projectId: string) => {
    const updatedProjects = localProjects.map(p => 
      p.id === projectId ? { ...p, pinned: !p.pinned } : p
    );
    setLocalProjects(updatedProjects);
    const updatedProject = updatedProjects.find(p => p.id === projectId);
    if (updatedProject && onUpdateProject) {
      onUpdateProject(updatedProject);
    }
  };

  const handleToggleStar = (projectId: string) => {
    const updatedProjects = localProjects.map(p => 
      p.id === projectId ? { ...p, starred: !p.starred } : p
    );
    setLocalProjects(updatedProjects);
    const updatedProject = updatedProjects.find(p => p.id === projectId);
    if (updatedProject && onUpdateProject) {
      onUpdateProject(updatedProject);
    }
  };

  const handleToggleArchive = (projectId: string) => {
    const project = localProjects.find(p => p.id === projectId);
    const updatedProjects = localProjects.map(p => 
      p.id === projectId ? { ...p, archived: !p.archived } : p
    );
    setLocalProjects(updatedProjects);
    const updatedProject = updatedProjects.find(p => p.id === projectId);
    if (updatedProject && onUpdateProject) {
      onUpdateProject(updatedProject);
    }
  };

  const handleCreateFromTemplate = (partialProject: Partial<Project>) => {
    if (onCreateFromTemplate) {
      onCreateFromTemplate(partialProject);
    } else {
      // Fallback: create project locally
      const newProject: Project = {
        id: partialProject.id || `project-${Date.now()}`,
        name: partialProject.name || 'New Project',
        description: partialProject.description || '',
        clientId: partialProject.clientId || '',
        teamMemberIds: partialProject.teamMemberIds || [],
        startDate: partialProject.startDate || new Date().toISOString().split('T')[0],
        endDate: partialProject.endDate || new Date().toISOString().split('T')[0],
        status: partialProject.status || ProjectStatus.Planning,
        tasks: partialProject.tasks || [],
        tags: partialProject.tags || [],
        pinned: false,
        starred: false
      };
      setLocalProjects([...localProjects, newProject]);
    }
  };

  // Collaboration handlers - now with database persistence
  const loadNotesForProject = useCallback(async (projectId: string) => {
    try {
      const notes = await projectNotesService.getByProject(projectId);
      setProjectNotes(prev => ({
        ...prev,
        [projectId]: notes.map(n => ({
          id: n.id,
          content: n.content,
          authorId: n.authorId,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
          isPinned: n.isPinned
        }))
      }));
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, []);

  const loadActivitiesForProject = useCallback(async (projectId: string) => {
    try {
      const activities = await projectActivitiesService.getByProject(projectId);
      setProjectActivities(prev => ({
        ...prev,
        [projectId]: activities.map(a => ({
          id: a.id,
          type: a.type,
          description: a.description,
          userId: a.userId,
          timestamp: a.createdAt
        }))
      }));
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  }, []);

  // Load notes and activities when collaboration panel opens
  useEffect(() => {
    if (selectedProjectForCollab) {
      loadNotesForProject(selectedProjectForCollab.id);
      loadActivitiesForProject(selectedProjectForCollab.id);
    }
  }, [selectedProjectForCollab, loadNotesForProject, loadActivitiesForProject]);

  const handleAddNote = async (content: string) => {
    if (!selectedProjectForCollab) return;
    try {
      const newNote = await projectNotesService.create({
        projectId: selectedProjectForCollab.id,
        content,
        authorId: 'current-user', // Replace with actual user ID
        isPinned: false
      });
      
      setProjectNotes(prev => ({
        ...prev,
        [selectedProjectForCollab.id]: [
          { id: newNote.id, content: newNote.content, authorId: newNote.authorId, createdAt: newNote.createdAt, isPinned: newNote.isPinned },
          ...(prev[selectedProjectForCollab.id] || [])
        ]
      }));
      
      // Log activity
      await projectActivitiesService.log({
        projectId: selectedProjectForCollab.id,
        userId: 'current-user',
        type: 'note_added',
        description: 'Added a new note'
      });
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedProjectForCollab) return;
    try {
      await projectNotesService.delete(noteId);
      setProjectNotes(prev => ({
        ...prev,
        [selectedProjectForCollab.id]: (prev[selectedProjectForCollab.id] || []).filter(n => n.id !== noteId)
      }));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleEditNote = async (noteId: string, content: string) => {
    if (!selectedProjectForCollab) return;
    try {
      await projectNotesService.update(noteId, { content });
      setProjectNotes(prev => ({
        ...prev,
        [selectedProjectForCollab.id]: (prev[selectedProjectForCollab.id] || []).map(n => 
          n.id === noteId ? { ...n, content, updatedAt: new Date().toISOString() } : n
        )
      }));
    } catch (error) {
      console.error('Failed to edit note:', error);
    }
  };

  const handlePinNote = async (noteId: string) => {
    if (!selectedProjectForCollab) return;
    const note = projectNotes[selectedProjectForCollab.id]?.find(n => n.id === noteId);
    if (!note) return;
    
    try {
      await projectNotesService.update(noteId, { isPinned: !note.isPinned });
      setProjectNotes(prev => ({
        ...prev,
        [selectedProjectForCollab.id]: (prev[selectedProjectForCollab.id] || []).map(n => 
          n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
        )
      }));
    } catch (error) {
      console.error('Failed to pin note:', error);
    }
  };

  const handleAssignMember = async (memberId: string) => {
    if (!selectedProjectForCollab) return;
    const member = teamMembers.find(m => m.id === memberId);
    const updatedProjects = localProjects.map(p => 
      p.id === selectedProjectForCollab.id 
        ? { ...p, teamMemberIds: [...(p.teamMemberIds || []), memberId] }
        : p
    );
    setLocalProjects(updatedProjects);
    setSelectedProjectForCollab(updatedProjects.find(p => p.id === selectedProjectForCollab.id) || null);
    
    // Log activity
    try {
      await projectActivitiesService.log({
        projectId: selectedProjectForCollab.id,
        userId: 'current-user',
        type: 'member_added',
        description: `added ${member?.name || 'a team member'} to the project`
      });
      loadActivitiesForProject(selectedProjectForCollab.id);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedProjectForCollab) return;
    const member = teamMembers.find(m => m.id === memberId);
    const updatedProjects = localProjects.map(p => 
      p.id === selectedProjectForCollab.id 
        ? { ...p, teamMemberIds: (p.teamMemberIds || []).filter(id => id !== memberId) }
        : p
    );
    setLocalProjects(updatedProjects);
    setSelectedProjectForCollab(updatedProjects.find(p => p.id === selectedProjectForCollab.id) || null);
    
    // Log activity
    try {
      await projectActivitiesService.log({
        projectId: selectedProjectForCollab.id,
        userId: 'current-user',
        type: 'member_removed',
        description: `removed ${member?.name || 'a team member'} from the project`
      });
      loadActivitiesForProject(selectedProjectForCollab.id);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Quick status change handler
  const handleQuickStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    const oldProject = localProjects.find(p => p.id === projectId);
    const updatedProjects = localProjects.map(p => 
      p.id === projectId ? { ...p, status: newStatus } : p
    );
    setLocalProjects(updatedProjects);
    const updatedProject = updatedProjects.find(p => p.id === projectId);
    if (updatedProject && onUpdateProject) {
      onUpdateProject(updatedProject);
    }
    
    // Log activity
    try {
      await projectActivitiesService.log({
        projectId: projectId,
        userId: 'current-user',
        type: 'status_changed',
        description: `changed status from ${oldProject?.status || 'unknown'} to ${newStatus}`
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Quick add task handler
  const handleQuickAddTask = async (projectId: string, taskDescription: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      description: taskDescription,
      status: TaskStatus.ToDo,
      teamMemberId: '',
      dueDate: '',
      sharedWithClient: false,
      notes: ''
    };
    
    // Update local state
    const updatedProjects = localProjects.map(p => 
      p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p
    );
    setLocalProjects(updatedProjects);
    
    // Persist to database
    const updatedProject = updatedProjects.find(p => p.id === projectId);
    if (updatedProject && onUpdateProject) {
      onUpdateProject(updatedProject);
    }
    
    // Log activity
    try {
      await projectActivitiesService.log({
        projectId: projectId,
        userId: 'current-user',
        type: 'task_added',
        description: `added task: "${taskDescription}"`
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Bulk selection handlers
  const handleToggleSelect = (projectId: string) => {
    setSelectedProjectIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      // Auto-enable selection mode when first project is selected
      if (newSet.size > 0 && !isSelectionMode) {
        setIsSelectionMode(true);
      }
      // Auto-disable selection mode when no projects selected
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedProjectIds(new Set(searchedAndSortedProjects.map(p => p.id)));
  };

  const handleDeselectAll = () => {
    setSelectedProjectIds(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkDelete = async () => {
    if (selectedProjectIds.size === 0) return;
    
    const confirmed = confirm(`Are you sure you want to delete ${selectedProjectIds.size} project(s)? This action cannot be undone.`);
    if (!confirmed) return;
    
    // Delete each selected project
    for (const projectId of selectedProjectIds) {
      if (onDeleteProject) {
        onDeleteProject(projectId);
      }
    }
    
    // Clear selection
    setSelectedProjectIds(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkStatusChange = async (newStatus: ProjectStatus) => {
    if (selectedProjectIds.size === 0) return;
    
    const updatedProjects = localProjects.map(p => 
      selectedProjectIds.has(p.id) ? { ...p, status: newStatus } : p
    );
    setLocalProjects(updatedProjects);
    
    // Persist to database and log activities
    for (const projectId of selectedProjectIds) {
      const oldProject = localProjects.find(p => p.id === projectId);
      const updatedProject = updatedProjects.find(p => p.id === projectId);
      if (updatedProject && onUpdateProject) {
        onUpdateProject(updatedProject);
      }
      // Log activity for each project
      try {
        await projectActivitiesService.log({
          projectId: projectId,
          userId: 'current-user',
          type: 'status_changed',
          description: `changed status from ${oldProject?.status || 'unknown'} to ${newStatus}`
        });
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    }
    
    // Clear selection
    setSelectedProjectIds(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkArchive = () => {
    if (selectedProjectIds.size === 0) return;
    
    const confirmed = confirm(`Archive ${selectedProjectIds.size} project(s)? Archived projects will be hidden from the main view.`);
    if (!confirmed) return;
    
    // For now, archive = set status to Completed (we can add a proper archived field later)
    const updatedProjects = localProjects.map(p => 
      selectedProjectIds.has(p.id) ? { ...p, status: ProjectStatus.Completed, archived: true } : p
    );
    setLocalProjects(updatedProjects);
    
    // Persist to database
    for (const projectId of selectedProjectIds) {
      const updatedProject = updatedProjects.find(p => p.id === projectId);
      if (updatedProject && onUpdateProject) {
        onUpdateProject(updatedProject);
      }
    }
    
    // Clear selection
    setSelectedProjectIds(new Set());
    setIsSelectionMode(false);
  };

  const handleCancelSelection = () => {
    setSelectedProjectIds(new Set());
    setIsSelectionMode(false);
  };

  // Search and Sort logic
  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Unknown';
  
  const searchedAndSortedProjects = useMemo(() => {
    let result = [...localProjects];
    
    // Filter archived projects unless showArchived is true
    if (!showArchived) {
      result = result.filter(p => !p.archived);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        getClientName(p.clientId).toLowerCase().includes(query) ||
        p.status.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          break;
        case 'status':
          const statusOrder = { [ProjectStatus.InProgress]: 0, [ProjectStatus.Planning]: 1, [ProjectStatus.OnHold]: 2, [ProjectStatus.Completed]: 3 };
          comparison = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
          break;
        case 'client':
          comparison = getClientName(a.clientId).localeCompare(getClientName(b.clientId));
          break;
        case 'progress':
          const progressA = a.tasks.length ? (a.tasks.filter(t => t.status === 'Done').length / a.tasks.length) : 0;
          const progressB = b.tasks.length ? (b.tasks.filter(t => t.status === 'Done').length / b.tasks.length) : 0;
          comparison = progressA - progressB;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    // Keep pinned at top
    result.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    
    return result;
  }, [localProjects, searchQuery, sortBy, sortOrder, clients, showArchived]);

  // Pagination for projects
  const {
    paginatedItems: paginatedProjects,
    currentPage,
    totalPages,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    resetPagination,
  } = usePagination(searchedAndSortedProjects, 12); // 12 items per page for 3x4 grid

  // Reset pagination when search/filter/sort changes
  useEffect(() => {
    resetPagination();
  }, [searchQuery, sortBy, sortOrder, showArchived, resetPagination]);

  // Count archived projects for UI
  const archivedCount = localProjects.filter(p => p.archived).length;

  // Define filterable fields
  const filterConfigs: FilterConfig[] = [
    {
      field: 'status',
      label: 'Status',
      type: 'select',
      options: Object.values(ProjectStatus).map(s => ({ value: s, label: s })),
    },
    {
      field: 'clientId',
      label: 'Client',
      type: 'select',
      options: clients.map(c => ({ value: c.id, label: c.name })),
    },
    {
      field: 'name',
      label: 'Project Name',
      type: 'text',
    },
    {
      field: 'endDate',
      label: 'End Date',
      type: 'date',
    },
  ];

  // Define exportable fields
  const exportFields: ExportField[] = [
    { key: 'name', label: 'Project Name' },
    { key: 'status', label: 'Status' },
    { 
      key: 'clientId', 
      label: 'Client',
      format: (clientId) => clients.find(c => c.id === clientId)?.name || ''
    },
    { 
      key: 'startDate', 
      label: 'Start Date',
      format: (date) => date ? new Date(date).toLocaleDateString() : ''
    },
    { 
      key: 'endDate', 
      label: 'End Date',
      format: (date) => date ? new Date(date).toLocaleDateString() : ''
    },
  ];

  // Apply filters
  const filteredProjects = useMemo(() => 
    applyFilterLogic(localProjects, activeFilter),
    [localProjects, activeFilter]
  );

  const viewButtonClasses = (isActive: boolean) =>
    `px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none ${
        isActive
            ? 'bg-gradient-to-b from-white/80 to-white/50 dark:from-white/30 dark:to-white/10 text-slate-800 dark:text-white shadow-md'
            : 'text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-white/20'
    }`;

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Projects</h1>
          {filterLabel && (
            <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-semibold">
              {filterLabel}
            </span>
          )}
        </div>
        {!isLoading && filteredProjects.length !== localProjects.length && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Showing {filteredProjects.length} of {localProjects.length} projects.
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Phase 3 Feature Buttons */}
          <ProjectTemplates
            onCreateFromTemplate={handleCreateFromTemplate}
            clients={clients.map(c => ({ id: c.id, name: c.name }))}
          />
          
          <ProjectComparison
            projects={localProjects}
            clients={clients}
            onSelectProject={onSelectProject}
          />
          
          <ExportButton
            data={filteredProjects}
            fields={exportFields}
            filename="projects_quick_export"
          />
          
          <button
            onClick={() => setShowExportDialog(true)}
            className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Custom Export...
          </button>
          
          <AdvancedFilterPanel
              filters={filterConfigs}
              onApplyFilters={setActiveFilter}
              savedFilters={savedFilters}
              onSaveFilter={(name, group) => {
                const newFilter: SavedFilter = { id: `filter-${Date.now()}`, name, group, createdAt: new Date() };
                setSavedFilters([...savedFilters, newFilter]);
              }}
          />
          
          {/* Select Mode Toggle */}
          <button
            onClick={() => {
              if (isSelectionMode) {
                handleDeselectAll();
              } else {
                setIsSelectionMode(true);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isSelectionMode 
                ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <CheckboxIcon checked={isSelectionMode} className="h-4 w-4" />
            {isSelectionMode ? 'Cancel' : 'Select'}
          </button>
          
          <button onClick={onAddProject} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
              <PlusIcon size="sm" /> New Project
          </button>
          
          <div className="flex items-center gap-1 p-1 bg-black/10 dark:bg-black/20 rounded-lg border border-white/20 dark:border-white/10">
              <button onClick={() => setView('card')} className={viewButtonClasses(view === 'card')}>
                  Card
              </button>
              <button onClick={() => setView('timeline')} className={viewButtonClasses(view === 'timeline')}>
                  Timeline
              </button>
          </div>
      </div>
      
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, client, status..."
            className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/30 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ×
            </button>
          )}
        </div>
        
        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <SortIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 bg-white/50 dark:bg-black/30 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500"
          >
            <option value="date">Sort by Deadline</option>
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
            <option value="client">Sort by Client</option>
            <option value="progress">Sort by Progress</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className={`p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${sortOrder === 'desc' ? 'bg-white/50 dark:bg-black/30' : 'bg-cyan-100 dark:bg-cyan-900/50'}`}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* Results count */}
        {(searchQuery || sortBy !== 'date') && (
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            {searchedAndSortedProjects.length} project{searchedAndSortedProjects.length !== 1 ? 's' : ''} found
          </div>
        )}
        
        {/* Show Archived Toggle */}
        {archivedCount > 0 && (
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              showArchived 
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700' 
                : 'bg-white/50 dark:bg-black/30 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <ArchiveBoxIcon className="h-4 w-4" />
            {showArchived ? `Hide Archived (${archivedCount})` : `Show Archived (${archivedCount})`}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="text-shadow-strong">
      {onBackToHub && (
        <button
          onClick={onBackToHub}
          className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold mb-4 transition-colors text-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Command Center
        </button>
      )}
      
      {renderHeader()}
      
      {/* Phase 3: Pinned Projects Section */}
      {!isLoading && (
        <PinnedProjects
          projects={localProjects}
          clients={clients}
          onSelectProject={onSelectProject}
          onTogglePin={handleTogglePin}
          onToggleStar={handleToggleStar}
        />
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => <ProjectCardSkeleton key={index} />)}
        </div>
      ) : view === 'card' ? (
        localProjects.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<BriefcaseIcon />}
              title="No projects yet"
              description="Get started by creating your first project to organize your work and collaborate with your team."
              action={{
                label: 'Create Project',
                onClick: onAddProject
              }}
            />
          </div>
        ) : searchedAndSortedProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProjects.map((project, index) => (
                <div key={project.id} className="fade-in h-full" style={{ animationDelay: `${index * 50}ms` }}>
                  <ProjectCard
                    project={project}
                    clientName={getClientName(project.clientId)}
                    onSelectProject={onSelectProject}
                    onEditProject={onEditProject}
                    onDeleteProject={onDeleteProject}
                    onDuplicateProject={onDuplicateProject}
                    onTogglePin={handleTogglePin}
                    onToggleStar={handleToggleStar}
                    onToggleArchive={handleToggleArchive}
                    onOpenCollaboration={setSelectedProjectForCollab}
                    onStatusChange={handleQuickStatusChange}
                    onQuickAddTask={handleQuickAddTask}
                    isSelected={selectedProjectIds.has(project.id)}
                    isSelectionMode={isSelectionMode}
                    onToggleSelect={handleToggleSelect}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Component */}
            {searchedAndSortedProjects.length > itemsPerPage && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={searchedAndSortedProjects.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={[6, 12, 24, 48]}
                  showItemsPerPage={true}
                  showTotalItems={true}
                />
              </div>
            )}
          </>
        ) : (
          <div className="col-span-full text-center py-16 bg-white/30 dark:bg-black/20 backdrop-blur-xl rounded-lg border border-dashed border-white/20 dark:border-white/10">
            <p className="text-slate-700 dark:text-slate-300 font-semibold">No projects match your search or filters.</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Try adjusting your search or filters.</p>
          </div>
        )
      ) : (
        <ProjectTimeline projects={searchedAndSortedProjects} clients={clients} onSelectProject={onSelectProject} />
      )}
      
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        data={searchedAndSortedProjects}
        availableFields={exportFields}
        title="Projects"
      />

      {/* Phase 3: Collaboration Panel */}
      {selectedProjectForCollab && (
        <ProjectCollaboration
          projectId={selectedProjectForCollab.id}
          projectName={selectedProjectForCollab.name}
          notes={projectNotes[selectedProjectForCollab.id] || []}
          activityLog={projectActivities[selectedProjectForCollab.id] || []}
          teamMembers={teamMembers}
          assignedMemberIds={selectedProjectForCollab.teamMemberIds || []}
          currentUserId="current-user"
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onEditNote={handleEditNote}
          onPinNote={handlePinNote}
          onAssignMember={handleAssignMember}
          onRemoveMember={handleRemoveMember}
          onClose={() => setSelectedProjectForCollab(null)}
        />
      )}

      {/* Bulk Action Bar */}
      {isSelectionMode && selectedProjectIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedProjectIds.size}
          totalCount={searchedAndSortedProjects.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onBulkDelete={handleBulkDelete}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkArchive={handleBulkArchive}
          onCancel={handleDeselectAll}
        />
      )}
    </div>
  );
};
