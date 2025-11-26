import React from 'react';
import type { Project, Client } from '../types';

interface ProjectFlowchartProps {
  projects: Project[];
  clients: Client[];
}

export const ProjectFlowchart: React.FC<ProjectFlowchartProps> = ({
  projects,
  clients
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Flowchart Builder</h1>
        <p className="text-slate-600 dark:text-slate-400">Visual workflow designer</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white/20 dark:bg-slate-900/40 rounded-lg border border-white/20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🌊</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Flowchart Builder Coming Soon!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Create visual workflows, define stages and dependencies, and export as diagrams.
          </p>
          <div className="space-y-2 text-left bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Planned Features:</p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Drag-and-drop workflow designer</li>
              <li>• Custom stages and transitions</li>
              <li>• Conditional branching</li>
              <li>• Export to PNG/SVG/PDF</li>
              <li>• Template library</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
