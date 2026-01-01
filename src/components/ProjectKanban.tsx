import React, { useState, useMemo } from 'react';
import type { Project, Client } from '../types';
import { ProjectStatus } from '../types';
import { ClockIcon, UsersIcon, CheckCircleIcon, AlertCircleIcon, BriefcaseIcon } from './icons';

interface ProjectKanbanProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (id: string) => void;
  onUpdateProjectStatus: (projectId: string, newStatus: ProjectStatus) => void;
}

interface KanbanColumn {
  id: ProjectStatus;
  title: string;
  color: string;
  icon: React.ReactNode;
}

const columns: KanbanColumn[] = [
  {
    id: ProjectStatus.Planning,
    title: 'Planning',
    color: 'from-blue-400 to-blue-500',
    icon: <BriefcaseIcon />
  },
  {
    id: ProjectStatus.InProgress,
    title: 'In Progress',
    color: 'from-green-400 to-green-500',
    icon: <AlertCircleIcon className="h-5 w-5" />
  },
  {
    id: ProjectStatus.OnHold,
    title: 'On Hold',
    color: 'from-orange-400 to-orange-500',
    icon: <AlertCircleIcon className="h-5 w-5" />
  },
  {
    id: ProjectStatus.Completed,
    title: 'Completed',
    color: 'from-purple-400 to-purple-500',
    icon: <CheckCircleIcon className="h-5 w-5" />
  }
];

export const ProjectKanban: React.FC<ProjectKanbanProps> = ({
  projects,
  clients,
  onSelectProject,
  onUpdateProjectStatus
}) => {
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ProjectStatus | null>(null);

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
      if (grouped[project.status]) {
        grouped[project.status].push(project);
      }
    });

    return grouped;
  }, [projects]);

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: ProjectStatus) => {
    e.preventDefault();
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

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const client = clients.find(c => c.id === project.clientId);
    const completedTasks = project.tasks.filter(t => t.status === 'Done').length;
    const totalTasks = project.tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const isDragging = draggedProject?.id === project.id;

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, project)}
        onDragEnd={handleDragEnd}
        onClick={() => onSelectProject(project.id)}
        className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-move hover:shadow-md transition-all ${
          isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
          {project.name}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          {client?.name || 'Unknown Client'}
        </p>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks & Deadline */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <CheckCircleIcon className="h-4 w-4" />
            <span>{completedTasks}/{totalTasks}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon />
            <span>{new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Team Members Count */}
        {project.teamMemberIds.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <UsersIcon />
            <span>{project.teamMemberIds.length} member{project.teamMemberIds.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Kanban Board</h1>
        <p className="text-slate-600 dark:text-slate-400">Drag and drop projects between columns</p>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {columns.map(column => {
            const columnProjects = projectsByStatus[column.id] || [];
            const isOver = dragOverColumn === column.id;

            return (
              <div
                key={column.id}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex-shrink-0 w-80 flex flex-col bg-slate-100/50 dark:bg-slate-900/30 rounded-lg transition-all ${
                  isOver ? 'ring-2 ring-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : ''
                }`}
              >
                {/* Column Header */}
                <div className={`bg-gradient-to-r ${column.color} text-white p-4 rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {column.icon}
                      <h2 className="font-bold text-lg">{column.title}</h2>
                    </div>
                    <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-semibold">
                      {columnProjects.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {columnProjects.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-600">
                      <p className="text-sm">No projects</p>
                      {dragOverColumn === column.id && (
                        <p className="text-xs mt-2 text-cyan-600 dark:text-cyan-400">Drop here</p>
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
          })}
        </div>
      </div>
    </div>
  );
};
