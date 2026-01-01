import React, { useState, useMemo, useEffect } from 'react';
import type { Project, Client, TeamMember } from '../types';
import { ProjectStatus } from '../types';
import { ProjectTimeline } from './ProjectTimeline';
import { getDeadlineStatus } from '../src/utils/dateHelpers';
import { StatusBadge } from '../src/components/ui/StatusBadge';
import { ClockIcon, BriefcaseIcon, PlusIcon, StarIcon, PinIcon } from './icons';
import { EmptyState } from '../src/components/ui/EmptyState';
import { AdvancedFilterPanel, FilterConfig, FilterGroup, SavedFilter } from './filters/AdvancedFilterPanel';
import { applyFilterLogic } from './filters/filterLogic';
import { ExportButton, ExportDialog, ExportField } from './export/ExportButton';
import { Skeleton } from '../src/components/ui/Skeleton';
import { ProgressRing } from '../src/components/charts/ProgressRing';

// Phase 3 Power Features
import { 
  PinnedProjects, 
  ProjectTemplates, 
  ProjectComparison,
  ProjectCollaboration,
  type ProjectNote,
  type ProjectActivityItem
} from '../src/components/projects';


interface ProjectListProps {
  projects: Project[];
  clients: Client[];
  teamMembers?: TeamMember[];
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  onUpdateProject?: (id: string, updates: Partial<Project>) => void;
  onCreateProject?: (project: Partial<Project>) => void;
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

interface ProjectCardProps {
  project: Project;
  clientName: string;
  onSelectProject: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleStar: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  clientName, 
  onSelectProject,
  onTogglePin,
  onToggleStar
}) => {
    const completionPercentage = project.tasks.length > 0
        ? (project.tasks.filter(t => t.status === 'Done').length / project.tasks.length) * 100
        : 0;
    
    const deadline = getDeadlineStatus(project.endDate, project.status === ProjectStatus.Completed);

    return (
        <div className="bg-white/25 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-xl border border-white/30 dark:border-slate-700/50 shadow-lg flex flex-col justify-between hover:border-primary-400/50 dark:hover:border-primary-500/50 text-shadow-strong h-full card-lift-subtle group">
            <div>
                {/* Top action bar */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleStar(project.id); }}
                            className={`p-1.5 rounded-lg transition-all ${
                                project.starred 
                                    ? 'bg-amber-400 text-white shadow-md' 
                                    : 'bg-white/30 dark:bg-slate-800/30 text-slate-400 hover:text-amber-500 opacity-0 group-hover:opacity-100'
                            }`}
                            title={project.starred ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <StarIcon filled={project.starred} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onTogglePin(project.id); }}
                            className={`p-1.5 rounded-lg transition-all ${
                                project.pinned 
                                    ? 'bg-primary-500 text-white shadow-md' 
                                    : 'bg-white/30 dark:bg-slate-800/30 text-slate-400 hover:text-primary-500 opacity-0 group-hover:opacity-100'
                            }`}
                            title={project.pinned ? 'Unpin project' : 'Pin project'}
                        >
                            <PinIcon filled={project.pinned} />
                        </button>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <StatusBadge 
                          label={project.status} 
                          variant={
                            project.status === ProjectStatus.Planning ? 'neutral' :
                            project.status === ProjectStatus.InProgress ? 'success' :
                            project.status === ProjectStatus.Completed ? 'info' :
                            project.status === ProjectStatus.OnHold ? 'warning' : 'neutral'
                          }
                        />
                        {/* Progress Ring - shows on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ProgressRing 
                            progress={completionPercentage} 
                            size={50}
                            strokeWidth={4}
                            color="#06b6d4"
                            showPercentage={true}
                          />
                        </div>
                    </div>
                </div>

                <div className="flex-1 pr-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{project.name}</h3>
                    <p className="text-sm text-primary-700 font-semibold dark:text-primary-300">{clientName}</p>
                </div>
                
                <p className="text-sm text-slate-700 line-clamp-2 mb-4 dark:text-slate-300 mt-3">{project.description}</p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {project.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                                #{tag}
                            </span>
                        ))}
                        {project.tags.length > 3 && (
                            <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                                +{project.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}
                
                <div className="flex justify-between items-center text-sm mb-4 p-3 bg-white/30 dark:bg-slate-800/30 rounded-lg">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Deadline</span>
                    <span className={`flex items-center gap-1 font-semibold ${deadline.color}`}>
                        <ClockIcon />
                        {deadline.text}
                    </span>
                </div>

                <div className="mb-2">
                    <div className="flex justify-between text-xs text-slate-600 mb-2 dark:text-slate-400">
                        <span className="font-semibold">Progress</span>
                        <span className="font-bold">{Math.round(completionPercentage)}%</span>
                    </div>
                    <div className="w-full bg-slate-200/50 rounded-full h-2.5 dark:bg-slate-800/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-500 to-primary-400 h-2.5 rounded-full transition-all duration-500 ease-out relative overflow-hidden" style={{ width: `${completionPercentage}%` }}>
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1 dark:text-slate-500">
                        <span>{project.tasks.filter(t => t.status === 'Done').length} of {project.tasks.length} tasks</span>
                    </div>
                </div>
            </div>
            
            <button
                onClick={() => onSelectProject(project.id)}
                className="mt-4 w-full text-center bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            >
                View Details
            </button>
        </div>
    );
};


export const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  clients, 
  teamMembers = [],
  onSelectProject, 
  onAddProject,
  onUpdateProject,
  onCreateProject 
}) => {
  const [view, setView] = useState<'card' | 'timeline'>('card');
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterGroup | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Phase 3: Collaboration state
  const [projectNotes, setProjectNotes] = useState<Record<string, ProjectNote[]>>({});
  const [projectActivity, setProjectActivity] = useState<Record<string, ProjectActivityItem[]>>({});
  const [selectedProjectForCollab, setSelectedProjectForCollab] = useState<Project | null>(null);
  const currentUserId = teamMembers[0]?.id || 'user-1'; // Default to first team member

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Phase 3: Pin/Star handlers
  const handleTogglePin = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && onUpdateProject) {
      onUpdateProject(projectId, { pinned: !project.pinned });
    }
  };

  const handleToggleStar = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && onUpdateProject) {
      onUpdateProject(projectId, { starred: !project.starred });
    }
  };

  // Phase 3: Template handler
  const handleCreateFromTemplate = (projectData: Partial<Project>) => {
    if (onCreateProject) {
      onCreateProject(projectData);
    }
  };

  // Phase 3: Collaboration handlers
  const handleAddNote = (projectId: string) => (content: string) => {
    const newNote: ProjectNote = {
      id: `note-${Date.now()}`,
      content,
      authorId: currentUserId,
      createdAt: new Date().toISOString()
    };
    setProjectNotes(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newNote]
    }));
    
    // Add activity
    const activity: ProjectActivityItem = {
      id: `activity-${Date.now()}`,
      type: 'note_added',
      description: 'added a note',
      userId: currentUserId,
      timestamp: new Date().toISOString()
    };
    setProjectActivity(prev => ({
      ...prev,
      [projectId]: [activity, ...(prev[projectId] || [])]
    }));
  };

  const handleDeleteNote = (projectId: string) => (noteId: string) => {
    setProjectNotes(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(n => n.id !== noteId)
    }));
  };

  const handleEditNote = (projectId: string) => (noteId: string, content: string) => {
    setProjectNotes(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(n => 
        n.id === noteId ? { ...n, content, updatedAt: new Date().toISOString() } : n
      )
    }));
  };

  const handlePinNote = (projectId: string) => (noteId: string) => {
    setProjectNotes(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(n => 
        n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
      )
    }));
  };

  const handleAssignMember = (projectId: string) => (memberId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && onUpdateProject) {
      onUpdateProject(projectId, { 
        teamMemberIds: [...(project.teamMemberIds || []), memberId] 
      });
      
      const activity: ProjectActivityItem = {
        id: `activity-${Date.now()}`,
        type: 'member_added',
        description: `added ${teamMembers.find(m => m.id === memberId)?.name || 'a team member'} to the project`,
        userId: currentUserId,
        timestamp: new Date().toISOString()
      };
      setProjectActivity(prev => ({
        ...prev,
        [projectId]: [activity, ...(prev[projectId] || [])]
      }));
    }
  };

  const handleRemoveMember = (projectId: string) => (memberId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && onUpdateProject) {
      onUpdateProject(projectId, { 
        teamMemberIds: (project.teamMemberIds || []).filter(id => id !== memberId)
      });
    }
  };

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
    {
      field: 'pinned',
      label: 'Pinned',
      type: 'select',
      options: [
        { value: 'true', label: 'Pinned Only' },
        { value: 'false', label: 'Not Pinned' }
      ]
    },
    {
      field: 'starred',
      label: 'Starred',
      type: 'select',
      options: [
        { value: 'true', label: 'Starred Only' },
        { value: 'false', label: 'Not Starred' }
      ]
    }
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
    {
      key: 'tasks',
      label: 'Total Tasks',
      format: (tasks) => tasks?.length?.toString() || '0'
    },
    {
      key: 'tasks',
      label: 'Completed Tasks',
      format: (tasks) => tasks?.filter((t: any) => t.status === 'Done')?.length?.toString() || '0'
    },
    {
      key: 'pinned',
      label: 'Pinned',
      format: (val) => val ? 'Yes' : 'No'
    },
    {
      key: 'starred',
      label: 'Starred',
      format: (val) => val ? 'Yes' : 'No'
    }
  ];

  // Apply filters
  const filteredProjects = useMemo(() => 
    applyFilterLogic(projects, activeFilter),
    [projects, activeFilter]
  );

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  };

  const viewButtonClasses = (isActive: boolean) =>
    `px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none ${
        isActive
            ? 'bg-gradient-to-b from-white/80 to-white/50 dark:from-white/30 dark:to-white/10 text-slate-800 dark:text-white shadow-md'
            : 'text-slate-600 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-white/20'
    }`;


  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Projects</h1>
        {!isLoading && filteredProjects.length !== projects.length && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Showing {filteredProjects.length} of {projects.length} projects.
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Phase 3: Templates Button */}
          <ProjectTemplates
            onCreateFromTemplate={handleCreateFromTemplate}
            clients={clients}
          />

          {/* Phase 3: Compare Button */}
          <ProjectComparison
            projects={projects}
            clients={clients}
            onSelectProject={onSelectProject}
          />

          {/* Phase 3: Collaborate Button (opens for selected project) */}
          {selectedProjectForCollab && (
            <ProjectCollaboration
              projectId={selectedProjectForCollab.id}
              projectName={selectedProjectForCollab.name}
              notes={projectNotes[selectedProjectForCollab.id] || []}
              activityLog={projectActivity[selectedProjectForCollab.id] || []}
              teamMembers={teamMembers}
              assignedMemberIds={selectedProjectForCollab.teamMemberIds || []}
              currentUserId={currentUserId}
              onAddNote={handleAddNote(selectedProjectForCollab.id)}
              onDeleteNote={handleDeleteNote(selectedProjectForCollab.id)}
              onEditNote={handleEditNote(selectedProjectForCollab.id)}
              onPinNote={handlePinNote(selectedProjectForCollab.id)}
              onAssignMember={handleAssignMember(selectedProjectForCollab.id)}
              onRemoveMember={handleRemoveMember(selectedProjectForCollab.id)}
            />
          )}

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
    </div>
  );

  return (
    <div className="text-shadow-strong page-transition">
      {renderHeader()}
      
      {/* Phase 3: Pinned/Favorites Section */}
      {!isLoading && (
        <PinnedProjects
          projects={projects}
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
        projects.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<BriefcaseIcon />}
              title="No projects yet"
              description="Get started by creating your first project or use a template to quickly set up common non-profit projects."
              action={{
                label: 'Create Project',
                onClick: onAddProject
              }}
            />
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects
              .filter(p => !p.pinned && !p.starred) // Don't show pinned/starred in main grid
              .map((project, index) => (
              <div key={project.id} className="stagger-item h-full" style={{ animationDelay: `${index * 80}ms` }}>
                <ProjectCard
                  project={project}
                  clientName={getClientName(project.clientId)}
                  onSelectProject={(id) => {
                    setSelectedProjectForCollab(project);
                    onSelectProject(id);
                  }}
                  onTogglePin={handleTogglePin}
                  onToggleStar={handleToggleStar}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center py-16 bg-white/30 dark:bg-black/20 backdrop-blur-xl rounded-lg border border-dashed border-white/20 dark:border-white/10">
            <p className="text-slate-700 dark:text-slate-300 font-semibold">No projects match the selected filters.</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Try adjusting the filters.</p>
          </div>
        )
      ) : (
        <ProjectTimeline projects={filteredProjects} clients={clients} onSelectProject={onSelectProject} />
      )}
      
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        data={filteredProjects}
        availableFields={exportFields}
        title="Projects"
      />
    </div>
  );
};
