// PinnedProjects.tsx - Favorites/Pinned Projects Section
import React from 'react';
import type { Project, Client } from '../../types';
import { ProjectStatus } from '../../types';
import { StarIcon, PinIcon, ClockIcon } from '../icons';
import { StatusBadge } from '../ui/StatusBadge';
import { getDeadlineStatus } from '../../utils/dateHelpers';

interface PinnedProjectsProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (id: string) => void;
  onTogglePin: (projectId: string) => void;
  onToggleStar: (projectId: string) => void;
}

const PinnedProjectCard: React.FC<{
  project: Project;
  clientName: string;
  onSelectProject: (id: string) => void;
  onTogglePin: (projectId: string) => void;
  onToggleStar: (projectId: string) => void;
}> = ({ project, clientName, onSelectProject, onTogglePin, onToggleStar }) => {
  const completionPercentage = project.tasks.length > 0
    ? (project.tasks.filter(t => t.status === 'Done').length / project.tasks.length) * 100
    : 0;
  
  const deadline = getDeadlineStatus(project.endDate, project.status === ProjectStatus.Completed);

  return (
    <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-900/20 dark:to-orange-900/10 backdrop-blur-xl p-4 rounded-xl border-2 border-amber-300/50 dark:border-amber-600/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
      {/* Action buttons */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStar(project.id); }}
            className={`p-1.5 rounded-lg transition-all ${
              project.starred 
                ? 'bg-amber-400 text-white shadow-md' 
                : 'bg-white/50 dark:bg-slate-800/50 text-slate-400 hover:text-amber-500'
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
                : 'bg-white/50 dark:bg-slate-800/50 text-slate-400 hover:text-primary-500'
            }`}
            title={project.pinned ? 'Unpin project' : 'Pin project'}
          >
            <PinIcon filled={project.pinned} />
          </button>
        </div>
        <StatusBadge 
          label={project.status} 
          variant={
            project.status === ProjectStatus.Planning ? 'neutral' :
            project.status === ProjectStatus.InProgress ? 'success' :
            project.status === ProjectStatus.Completed ? 'info' :
            project.status === ProjectStatus.OnHold ? 'warning' : 'neutral'
          }
          size="sm"
        />
      </div>

      {/* Project info */}
      <div 
        className="cursor-pointer"
        onClick={() => onSelectProject(project.id)}
      >
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
          {project.name}
        </h3>
        <p className="text-xs text-primary-700 dark:text-primary-300 font-semibold mb-2">
          {clientName}
        </p>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
            <span>Progress</span>
            <span className="font-semibold">{Math.round(completionPercentage)}%</span>
          </div>
          <div className="w-full bg-slate-200/50 rounded-full h-1.5 dark:bg-slate-700/50">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-1 text-xs">
          <ClockIcon />
          <span className={deadline.color}>{deadline.text}</span>
        </div>
      </div>
    </div>
  );
};

export const PinnedProjects: React.FC<PinnedProjectsProps> = ({
  projects,
  clients,
  onSelectProject,
  onTogglePin,
  onToggleStar,
}) => {
  const pinnedProjects = projects.filter(p => p.pinned || p.starred);

  if (pinnedProjects.length === 0) {
    return null;
  }

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
          <StarIcon filled />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Pinned & Favorites
        </h2>
        <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
          {pinnedProjects.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {pinnedProjects.map((project) => (
          <PinnedProjectCard
            key={project.id}
            project={project}
            clientName={getClientName(project.clientId)}
            onSelectProject={onSelectProject}
            onTogglePin={onTogglePin}
            onToggleStar={onToggleStar}
          />
        ))}
      </div>
    </div>
  );
};

export default PinnedProjects;
