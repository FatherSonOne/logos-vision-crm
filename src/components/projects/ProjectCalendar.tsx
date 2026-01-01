import React, { useState, useEffect } from 'react';
import type { Project, Client, Task } from '../../types';
import { ProjectOrbitCalendar } from './ProjectOrbitCalendar';
import { ProjectStackedAgenda } from './ProjectStackedAgenda';
import {
  CalendarIcon,
  GridIcon,
  ListIcon
} from '../icons';

interface ProjectCalendarProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (id: string) => void;
  onSelectTask?: (task: Task, projectId: string) => void;
  onAddTask?: (date: Date) => void;
}

type ViewMode = 'auto' | 'orbit' | 'agenda';

// Custom hook for responsive detection
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

export const ProjectCalendar: React.FC<ProjectCalendarProps> = ({
  projects,
  clients,
  onSelectProject,
  onSelectTask,
  onAddTask,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('auto');

  // Detect if mobile (< 768px) or desktop
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  // Determine which view to show
  const activeView = viewMode === 'auto'
    ? (isMobile ? 'agenda' : 'orbit')
    : viewMode;

  return (
    <div className="h-full flex flex-col">
      {/* View Toggle Header - Only show on tablet/desktop or when not auto */}
      {(!isMobile || viewMode !== 'auto') && (
        <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Project Calendar
            </span>
            {viewMode === 'auto' && (
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                ({isMobile ? 'Mobile' : 'Desktop'} view)
              </span>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-700 rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode('auto')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                viewMode === 'auto'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title="Auto-detect based on screen size"
            >
              Auto
            </button>
            <button
              onClick={() => setViewMode('orbit')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'orbit'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title="Orbit view (best for desktop)"
            >
              <GridIcon className="h-3 w-3" />
              Orbit
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'agenda'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title="Agenda view (best for mobile)"
            >
              <ListIcon className="h-3 w-3" />
              Agenda
            </button>
          </div>
        </div>
      )}

      {/* Calendar View */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'orbit' ? (
          <ProjectOrbitCalendar
            projects={projects}
            clients={clients}
            onSelectProject={onSelectProject}
            onSelectTask={onSelectTask}
          />
        ) : (
          <ProjectStackedAgenda
            projects={projects}
            clients={clients}
            onSelectProject={onSelectProject}
            onSelectTask={onSelectTask}
            onAddTask={onAddTask}
          />
        )}
      </div>

      {/* Mobile Bottom Toggle (only on mobile in auto mode) */}
      {isMobile && viewMode === 'auto' && (
        <div className="p-2 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('orbit')}
            className="w-full py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center justify-center gap-2"
          >
            <GridIcon className="h-3 w-3" />
            Switch to Orbit View
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectCalendar;
