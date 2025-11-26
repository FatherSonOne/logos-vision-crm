import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Project, Client } from '../types';
import { DownloadIcon, CheckCircleIcon, FileTextIcon } from './icons';

interface ProjectExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  clients: Client[];
}

export const ProjectExportModal: React.FC<ProjectExportModalProps> = ({
  isOpen,
  onClose,
  projects,
  clients
}) => {
  const [exportType, setExportType] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [includeFields, setIncludeFields] = useState({
    basic: true,
    tasks: true,
    team: true,
    timeline: true,
    health: true
  });

  const toggleProject = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const selectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map(p => p.id));
    }
  };

  const handleExport = () => {
    const projectsToExport = projects.filter(p => selectedProjects.includes(p.id));
    
    if (exportType === 'csv') {
      exportToCSV(projectsToExport);
    } else if (exportType === 'pdf') {
      alert('PDF export coming soon!');
    } else if (exportType === 'excel') {
      alert('Excel export coming soon!');
    }
  };

  const exportToCSV = (projectsToExport: Project[]) => {
    const headers = [];
    
    if (includeFields.basic) {
      headers.push('Project Name', 'Client', 'Status', 'Description');
    }
    if (includeFields.timeline) {
      headers.push('Start Date', 'End Date', 'Duration (days)');
    }
    if (includeFields.tasks) {
      headers.push('Total Tasks', 'Completed Tasks', 'Task Completion %');
    }
    if (includeFields.team) {
      headers.push('Team Size');
    }
    if (includeFields.health) {
      headers.push('Health Status', 'Health Score');
    }

    const rows = projectsToExport.map(project => {
      const client = clients.find(c => c.id === project.clientId);
      const row = [];

      if (includeFields.basic) {
        row.push(
          project.name,
          client?.name || 'Unknown',
          project.status,
          `"${project.description.replace(/"/g, '""')}"`
        );
      }

      if (includeFields.timeline) {
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        row.push(
          project.startDate,
          project.endDate,
          duration
        );
      }

      if (includeFields.tasks) {
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(t => t.status === 'Done').length;
        const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        row.push(totalTasks, completedTasks, completion);
      }

      if (includeFields.team) {
        row.push(project.teamMemberIds.length);
      }

      if (includeFields.health) {
        // Simplified health calculation
        const completion = project.tasks.length > 0 
          ? (project.tasks.filter(t => t.status === 'Done').length / project.tasks.length) * 100 
          : 0;
        const health = completion >= 70 ? 'Healthy' : completion >= 40 ? 'Warning' : 'Critical';
        const score = Math.round(completion);
        row.push(health, score);
      }

      return row.join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Projects & Generate Reports"
      size="lg"
    >
      <div className="space-y-6">
        {/* Export Type Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setExportType('csv')}
              className={`p-4 rounded-lg border-2 transition-all ${
                exportType === 'csv'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <FileTextIcon className="h-8 w-8 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
              <div className="font-medium text-slate-900 dark:text-slate-100">CSV</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Spreadsheet format</div>
            </button>

            <button
              onClick={() => setExportType('excel')}
              className={`p-4 rounded-lg border-2 transition-all ${
                exportType === 'excel'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <FileTextIcon className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <div className="font-medium text-slate-900 dark:text-slate-100">Excel</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Coming soon</div>
            </button>

            <button
              onClick={() => setExportType('pdf')}
              className={`p-4 rounded-lg border-2 transition-all ${
                exportType === 'pdf'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <FileTextIcon className="h-8 w-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
              <div className="font-medium text-slate-900 dark:text-slate-100">PDF Report</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Coming soon</div>
            </button>
          </div>
        </div>

        {/* Field Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Include Fields
          </label>
          <div className="space-y-2">
            {[
              { key: 'basic', label: 'Basic Information', desc: 'Name, client, status, description' },
              { key: 'timeline', label: 'Timeline', desc: 'Start date, end date, duration' },
              { key: 'tasks', label: 'Tasks', desc: 'Task count and completion status' },
              { key: 'team', label: 'Team', desc: 'Team member count' },
              { key: 'health', label: 'Health Metrics', desc: 'Health status and scores' }
            ].map(field => (
              <label
                key={field.key}
                className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={includeFields[field.key as keyof typeof includeFields]}
                  onChange={(e) => setIncludeFields({
                    ...includeFields,
                    [field.key]: e.target.checked
                  })}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{field.label}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">{field.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Project Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Select Projects ({selectedProjects.length}/{projects.length})
            </label>
            <button
              onClick={selectAll}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {selectedProjects.length === projects.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
            {projects.map(project => {
              const client = clients.find(c => c.id === project.clientId);
              const isSelected = selectedProjects.includes(project.id);
              
              return (
                <label
                  key={project.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleProject(project.id)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{project.name}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {client?.name} • {project.status}
                    </div>
                  </div>
                  {isSelected && <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                </label>
              );
            })}
          </div>
        </div>

        {/* Export Button */}
        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={selectedProjects.length === 0}
            className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            <DownloadIcon />
            Export {selectedProjects.length} Project{selectedProjects.length !== 1 ? 's' : ''}
          </button>
        </div>

        {exportType !== 'csv' && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {exportType === 'pdf' ? 'PDF' : 'Excel'} export is coming soon! Currently only CSV export is available.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};