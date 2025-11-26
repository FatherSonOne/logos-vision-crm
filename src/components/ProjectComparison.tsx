import React, { useState } from 'react';
import type { Project, Client } from '../types';
import { CompareIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon, UsersIcon, TargetIcon } from './icons';

interface ProjectComparisonProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (projectId: string) => void;
}

export const ProjectComparison: React.FC<ProjectComparisonProps> = ({
  projects,
  clients,
  onSelectProject
}) => {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const maxSelection = 3;

  const toggleProjectSelection = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else if (selectedProjects.length < maxSelection) {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const selectedProjectsData = projects.filter(p => selectedProjects.includes(p.id));

  const getProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    return Math.round((project.tasks.filter(t => t.status === 'Done').length / project.tasks.length) * 100);
  };

  const getHealthStatus = (project: Project): 'healthy' | 'warning' | 'critical' => {
    const progress = getProgress(project);
    const now = new Date();
    const endDate = new Date(project.endDate);
    const isOverdue = endDate < now;
    
    if (isOverdue || progress < 30) return 'critical';
    if (progress < 60) return 'warning';
    return 'healthy';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <CompareIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Project Comparison</h1>
            <p className="text-slate-600 dark:text-slate-400">Select up to {maxSelection} projects to compare</p>
          </div>
        </div>
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {selectedProjects.length}/{maxSelection} selected
        </div>
      </div>

      {/* Project Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => {
          const client = clients.find(c => c.id === project.clientId);
          const isSelected = selectedProjects.includes(project.id);
          const progress = getProgress(project);
          
          return (
            <button
              key={project.id}
              onClick={() => toggleProjectSelection(project.id)}
              disabled={!isSelected && selectedProjects.length >= maxSelection}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isSelected 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg scale-105'
                  : 'border-white/20 bg-white/20 dark:bg-slate-900/40 hover:border-indigo-300 dark:hover:border-indigo-700'
              } ${!isSelected && selectedProjects.length >= maxSelection ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{project.name}</h3>
                {isSelected && (
                  <CheckCircleIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{client?.name}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {project.status}
                </span>
                <span className="text-slate-600 dark:text-slate-400">{progress}% complete</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Comparison Table */}
      {selectedProjectsData.length > 0 && (
        <div className="bg-white/30 dark:bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-b border-white/20">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Metric
                  </th>
                  {selectedProjectsData.map(project => (
                    <th key={project.id} className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {project.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Client */}
                <tr className="border-b border-white/10">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Client
                  </td>
                  {selectedProjectsData.map(project => (
                    <td key={project.id} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {clients.find(c => c.id === project.clientId)?.name || 'Unknown'}
                    </td>
                  ))}
                </tr>

                {/* Status */}
                <tr className="border-b border-white/10 bg-white/10 dark:bg-slate-800/20">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Status
                  </td>
                  {selectedProjectsData.map(project => (
                    <td key={project.id} className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {project.status}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Progress */}
                <tr className="border-b border-white/10">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <TargetIcon className="h-4 w-4" />
                    Progress
                  </td>
                  {selectedProjectsData.map(project => {
                    const progress = getProgress(project);
                    return (
                      <td key={project.id} className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[3rem]">
                            {progress}%
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Health Status */}
                <tr className="border-b border-white/10 bg-white/10 dark:bg-slate-800/20">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Health
                  </td>
                  {selectedProjectsData.map(project => {
                    const health = getHealthStatus(project);
                    return (
                      <td key={project.id} className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {health === 'healthy' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                          {health === 'warning' && <AlertCircleIcon className="h-5 w-5 text-yellow-500" />}
                          {health === 'critical' && <AlertCircleIcon className="h-5 w-5 text-red-500" />}
                          <span className={`text-sm font-medium capitalize ${
                            health === 'healthy' ? 'text-green-600 dark:text-green-400' :
                            health === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {health}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Tasks */}
                <tr className="border-b border-white/10">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tasks
                  </td>
                  {selectedProjectsData.map(project => (
                    <td key={project.id} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {project.tasks.filter(t => t.status === 'Done').length}/{project.tasks.length} completed
                    </td>
                  ))}
                </tr>

                {/* Team Size */}
                <tr className="border-b border-white/10 bg-white/10 dark:bg-slate-800/20">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    Team Size
                  </td>
                  {selectedProjectsData.map(project => (
                    <td key={project.id} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {project.teamMemberIds.length} members
                    </td>
                  ))}
                </tr>

                {/* Timeline */}
                <tr className="border-b border-white/10">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    Timeline
                  </td>
                  {selectedProjectsData.map(project => {
                    const start = new Date(project.startDate);
                    const end = new Date(project.endDate);
                    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <td key={project.id} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {duration} days
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {start.toLocaleDateString()} - {end.toLocaleDateString()}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Deadline Status */}
                <tr className="bg-white/10 dark:bg-slate-800/20">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Deadline
                  </td>
                  {selectedProjectsData.map(project => {
                    const now = new Date();
                    const endDate = new Date(project.endDate);
                    const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysUntil < 0;
                    
                    return (
                      <td key={project.id} className="px-6 py-4">
                        <span className={`text-sm font-semibold ${
                          isOverdue ? 'text-red-600 dark:text-red-400' :
                          daysUntil <= 7 ? 'text-orange-600 dark:text-orange-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>
                          {isOverdue 
                            ? `${Math.abs(daysUntil)} days overdue`
                            : daysUntil === 0 
                              ? 'Due today'
                              : `${daysUntil} days remaining`
                          }
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedProjectsData.length === 0 && (
        <div className="text-center py-12 bg-white/10 dark:bg-slate-900/20 rounded-xl border border-white/20">
          <CompareIcon className="h-16 w-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Select Projects to Compare
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Choose up to {maxSelection} projects to see a side-by-side comparison
          </p>
        </div>
      )}
    </div>
  );
};