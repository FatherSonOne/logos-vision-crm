// ProjectComparison.tsx - Side-by-side Project Comparison View
import React, { useState } from 'react';
import type { Project, Client } from '../../types';
import { ProjectStatus } from '../../types';
import { CompareIcon, CloseIcon, PlusIcon, BarChartIcon } from '../icons';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressRing } from '../charts/ProgressRing';

interface ProjectComparisonProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (id: string) => void;
}

interface ComparisonMetric {
  label: string;
  getValue: (project: Project) => string | number;
  format?: 'text' | 'number' | 'percent' | 'date' | 'currency';
  highlight?: 'higher' | 'lower' | 'none';
}

const comparisonMetrics: ComparisonMetric[] = [
  { 
    label: 'Status', 
    getValue: (p) => p.status,
    format: 'text'
  },
  { 
    label: 'Total Tasks', 
    getValue: (p) => p.tasks.length,
    format: 'number',
    highlight: 'higher'
  },
  { 
    label: 'Completed Tasks', 
    getValue: (p) => p.tasks.filter(t => t.status === 'Done').length,
    format: 'number',
    highlight: 'higher'
  },
  { 
    label: 'Completion Rate', 
    getValue: (p) => p.tasks.length > 0 
      ? Math.round((p.tasks.filter(t => t.status === 'Done').length / p.tasks.length) * 100)
      : 0,
    format: 'percent',
    highlight: 'higher'
  },
  { 
    label: 'In Progress Tasks', 
    getValue: (p) => p.tasks.filter(t => t.status === 'In Progress').length,
    format: 'number'
  },
  { 
    label: 'Pending Tasks', 
    getValue: (p) => p.tasks.filter(t => t.status === 'To Do').length,
    format: 'number',
    highlight: 'lower'
  },
  { 
    label: 'Team Members', 
    getValue: (p) => p.teamMemberIds?.length || 0,
    format: 'number'
  },
  { 
    label: 'Start Date', 
    getValue: (p) => p.startDate,
    format: 'date'
  },
  { 
    label: 'End Date', 
    getValue: (p) => p.endDate,
    format: 'date'
  },
  { 
    label: 'Duration (days)', 
    getValue: (p) => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    },
    format: 'number'
  }
];

const formatValue = (value: string | number, format?: string): string => {
  switch (format) {
    case 'percent':
      return `${value}%`;
    case 'date':
      return new Date(value as string).toLocaleDateString();
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value as number);
    case 'number':
      return value.toString();
    default:
      return value.toString();
  }
};


const ProjectSelector: React.FC<{
  projects: Project[];
  clients: Client[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  maxSelections: number;
}> = ({ projects, clients, selectedIds, onSelect, onRemove, maxSelections }) => {
  const availableProjects = projects.filter(p => !selectedIds.includes(p.id));
  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Unknown';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {selectedIds.map(id => {
        const project = projects.find(p => p.id === id);
        if (!project) return null;
        return (
          <div 
            key={id}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm"
          >
            <span className="font-medium">{project.name}</span>
            <button onClick={() => onRemove(id)} className="hover:text-red-500 transition-colors">
              <CloseIcon />
            </button>
          </div>
        );
      })}
      
      {selectedIds.length < maxSelections && (
        <select
          onChange={(e) => { if (e.target.value) onSelect(e.target.value); e.target.value = ''; }}
          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          defaultValue=""
        >
          <option value="" disabled>+ Add project to compare</option>
          {availableProjects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name} ({getClientName(project.clientId)})
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export const ProjectComparison: React.FC<ProjectComparisonProps> = ({
  projects,
  clients,
  onSelectProject
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Unknown';

  const handleAddProject = (id: string) => {
    if (selectedProjectIds.length < 3 && !selectedProjectIds.includes(id)) {
      setSelectedProjectIds([...selectedProjectIds, id]);
    }
  };

  const handleRemoveProject = (id: string) => {
    setSelectedProjectIds(selectedProjectIds.filter(pid => pid !== id));
  };

  const selectedProjects = selectedProjectIds
    .map(id => projects.find(p => p.id === id))
    .filter((p): p is Project => p !== undefined);

  const getHighlightClass = (metric: ComparisonMetric, value: string | number, allValues: (string | number)[]) => {
    if (metric.highlight === 'none' || !metric.highlight) return '';
    
    const numericValues = allValues.map(v => typeof v === 'number' ? v : parseFloat(v.toString()) || 0);
    const numValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0;
    
    const max = Math.max(...numericValues);
    const min = Math.min(...numericValues);
    
    if (metric.highlight === 'higher' && numValue === max && max !== min) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold';
    }
    if (metric.highlight === 'lower' && numValue === min && max !== min) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold';
    }
    return '';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
      >
        <CompareIcon />
        Compare
      </button>
    );
  }

  return (
    <div className="mb-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 text-white flex items-center justify-center">
              <CompareIcon />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Compare Projects</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">(up to 3)</span>
          </div>
          <button
            onClick={() => { setIsOpen(false); setSelectedProjectIds([]); }}
            className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <CloseIcon />
          </button>
        </div>
        
        <ProjectSelector
          projects={projects}
          clients={clients}
          selectedIds={selectedProjectIds}
          onSelect={handleAddProject}
          onRemove={handleRemoveProject}
          maxSelections={3}
        />
      </div>

      {/* Comparison Table */}
      {selectedProjects.length >= 2 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/50">
                <th className="p-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 w-40">
                  Metric
                </th>
                {selectedProjects.map(project => (
                  <th key={project.id} className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-slate-900 dark:text-white">{project.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{getClientName(project.clientId)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Visual Progress Row */}
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Progress
                </td>
                {selectedProjects.map(project => {
                  const completion = project.tasks.length > 0
                    ? (project.tasks.filter(t => t.status === 'Done').length / project.tasks.length) * 100
                    : 0;
                  return (
                    <td key={project.id} className="p-3 text-center">
                      <div className="flex justify-center">
                        <ProgressRing
                          progress={completion}
                          size={60}
                          strokeWidth={5}
                          color="#06b6d4"
                          showPercentage
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
              
              {/* Metric Rows */}
              {comparisonMetrics.map((metric, index) => {
                const values = selectedProjects.map(p => metric.getValue(p));
                return (
                  <tr key={index} className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {metric.label}
                    </td>
                    {selectedProjects.map((project, pIndex) => {
                      const value = values[pIndex];
                      const highlightClass = getHighlightClass(metric, value, values);
                      return (
                        <td key={project.id} className={`p-3 text-center text-sm ${highlightClass || 'text-slate-600 dark:text-slate-400'}`}>
                          {metric.label === 'Status' ? (
                            <div className="flex justify-center">
                              <StatusBadge 
                                label={value as string} 
                                variant={
                                  value === ProjectStatus.Planning ? 'neutral' :
                                  value === ProjectStatus.InProgress ? 'success' :
                                  value === ProjectStatus.Completed ? 'info' :
                                  value === ProjectStatus.OnHold ? 'warning' : 'neutral'
                                }
                                size="sm"
                              />
                            </div>
                          ) : (
                            formatValue(value, metric.format)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
          <BarChartIcon />
          <p className="mt-2">Select at least 2 projects to compare</p>
        </div>
      )}

      {/* Action Row */}
      {selectedProjects.length >= 2 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          {selectedProjects.map(project => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              View {project.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectComparison;
