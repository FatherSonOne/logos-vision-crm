import React, { useMemo, useState } from 'react';
import type { Project, Client } from '../types';
import { ProjectStatus } from '../types';

interface ProjectGanttProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (id: string) => void;
}

export const ProjectGantt: React.FC<ProjectGanttProps> = ({
  projects,
  clients,
  onSelectProject
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'quarter' | 'year'>('month');

  const timelineData = useMemo(() => {
    if (projects.length === 0) return { start: new Date(), end: new Date(), months: [] };

    const sortedProjects = [...projects].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const start = new Date(sortedProjects[0].startDate);
    const latestEnd = new Date(
      Math.max(...projects.map(p => new Date(p.endDate).getTime()))
    );

    // Add padding
    start.setMonth(start.getMonth() - 1);
    latestEnd.setMonth(latestEnd.getMonth() + 1);

    // Generate months
    const months: Date[] = [];
    const current = new Date(start);
    while (current <= latestEnd) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }

    return { start, end: latestEnd, months };
  }, [projects]);

  const getProjectPosition = (project: Project) => {
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);
    const timelineStart = timelineData.start;
    const timelineEnd = timelineData.end;

    const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
    const projectStartOffset = projectStart.getTime() - timelineStart.getTime();
    const projectDuration = projectEnd.getTime() - projectStart.getTime();

    const left = (projectStartOffset / totalDuration) * 100;
    const width = (projectDuration / totalDuration) * 100;

    return { left: Math.max(0, left), width: Math.max(1, width) };
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Planning:
        return 'from-blue-400 to-blue-500';
      case ProjectStatus.InProgress:
        return 'from-green-400 to-green-500';
      case ProjectStatus.OnHold:
        return 'from-orange-400 to-orange-500';
      case ProjectStatus.Completed:
        return 'from-purple-400 to-purple-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Gantt Chart</h1>
          <p className="text-slate-600 dark:text-slate-400">Project timeline and scheduling</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'month'
                ? 'bg-cyan-600 text-white'
                : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-white/70'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('quarter')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'quarter'
                ? 'bg-cyan-600 text-white'
                : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-white/70'
            }`}
          >
            Quarter
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'year'
                ? 'bg-cyan-600 text-white'
                : 'bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-white/70'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 overflow-auto bg-white/20 dark:bg-slate-900/40 rounded-lg border border-white/20">
        {projects.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
            No projects to display
          </div>
        ) : (
          <div className="min-w-max">
            {/* Timeline Header */}
            <div className="sticky top-0 z-10 bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700">
              <div className="flex">
                <div className="w-64 flex-shrink-0 p-4 font-semibold text-slate-900 dark:text-slate-100">
                  Project
                </div>
                <div className="flex-1 flex">
                  {timelineData.months.map((month, idx) => (
                    <div
                      key={idx}
                      className="flex-1 min-w-[100px] p-4 text-center border-l border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100"
                    >
                      {month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Rows */}
            <div>
              {projects.map((project, idx) => {
                const client = clients.find(c => c.id === project.clientId);
                const position = getProjectPosition(project);
                const completedTasks = project.tasks.filter(t => t.status === 'Done').length;
                const totalTasks = project.tasks.length;
                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <div
                    key={project.id}
                    className={`flex border-b border-slate-200 dark:border-slate-700 ${
                      idx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-900/20' : 'bg-white dark:bg-slate-900/10'
                    } hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors`}
                  >
                    {/* Project Info */}
                    <div className="w-64 flex-shrink-0 p-4 cursor-pointer" onClick={() => onSelectProject(project.id)}>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">
                        {project.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                        {client?.name || 'Unknown Client'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          project.status === ProjectStatus.InProgress
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                            : project.status === ProjectStatus.Planning
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            : project.status === ProjectStatus.Completed
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                        }`}>
                          {project.status}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {progress}%
                        </span>
                      </div>
                    </div>

                    {/* Timeline Bar */}
                    <div className="flex-1 p-4 relative">
                      <div className="relative h-12">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex">
                          {timelineData.months.map((_, idx) => (
                            <div
                              key={idx}
                              className="flex-1 min-w-[100px] border-l border-slate-200 dark:border-slate-700"
                            />
                          ))}
                        </div>

                        {/* Project Bar */}
                        <div
                          className="absolute top-2 h-8 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all group"
                          style={{
                            left: `${position.left}%`,
                            width: `${position.width}%`
                          }}
                          onClick={() => onSelectProject(project.id)}
                        >
                          <div className={`h-full rounded-lg bg-gradient-to-r ${getStatusColor(project.status)} flex items-center justify-between px-3 group-hover:scale-105 transition-transform`}>
                            <span className="text-xs font-semibold text-white truncate">
                              {project.name}
                            </span>
                            <span className="text-xs font-bold text-white ml-2">
                              {progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 rounded bg-gradient-to-r from-blue-400 to-blue-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Planning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 rounded bg-gradient-to-r from-green-400 to-green-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 rounded bg-gradient-to-r from-orange-400 to-orange-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">On Hold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 rounded bg-gradient-to-r from-purple-400 to-purple-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
        </div>
      </div>
    </div>
  );
};
