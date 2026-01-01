import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Project, Client, TeamMember, Task } from '../types';
import { ProjectStatus, TaskStatus } from '../types';
import { SparklesIcon, PlusIcon, ClipboardListIcon } from './icons';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Input';
import { Select } from './ui/Select';

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Partial<Project>) => void;
  onOpenAiPlanner: () => void;
  clients: Client[];
  teamMembers: TeamMember[];
}

type CreationMode = 'choice' | 'manual' | 'ai';

export const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  onOpenAiPlanner,
  clients,
  teamMembers
}) => {
  const [mode, setMode] = useState<CreationMode>('choice');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    teamMemberIds: [] as string[],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: ProjectStatus.Planning,
    initialTasks: ''
  });

  const handleClose = () => {
    setMode('choice');
    setFormData({
      name: '',
      description: '',
      clientId: '',
      teamMemberIds: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: ProjectStatus.Planning,
      initialTasks: ''
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse initial tasks (one per line)
    const tasks: Task[] = formData.initialTasks
      .split('\n')
      .filter(line => line.trim())
      .map((taskDesc, index) => ({
        id: `task-${Date.now()}-${index}`,
        description: taskDesc.trim(),
        teamMemberId: '',
        dueDate: '',
        status: TaskStatus.ToDo
      }));

    const newProject: Partial<Project> = {
      id: `project-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      clientId: formData.clientId,
      teamMemberIds: formData.teamMemberIds,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
      tasks,
      pinned: false,
      starred: false,
      tags: []
    };

    onCreateProject(newProject);
    handleClose();
  };

  const handleAiChoice = () => {
    handleClose();
    onOpenAiPlanner();
  };

  const handleTeamMemberToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMemberIds: prev.teamMemberIds.includes(memberId)
        ? prev.teamMemberIds.filter(id => id !== memberId)
        : [...prev.teamMemberIds, memberId]
    }));
  };

  // Choice Screen
  if (mode === 'choice') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project">
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
            How would you like to create your project?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Manual Option */}
            <button
              onClick={() => setMode('manual')}
              className="group p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-all hover:shadow-lg text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ClipboardListIcon />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Basic Form
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create a project manually by filling out details, dates, and adding tasks yourself.
              </p>
            </button>

            {/* AI Option */}
            <button
              onClick={handleAiChoice}
              className="group p-6 bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-xl border-2 border-violet-200 dark:border-violet-700 hover:border-violet-500 dark:hover:border-violet-500 transition-all hover:shadow-lg text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <SparklesIcon />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                AI Generate
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Describe your goal and let AI create a complete project plan with phases and tasks.
              </p>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
            <Button variant="ghost" onClick={handleClose} className="w-full">Cancel</Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Manual Form
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Back button */}
        <button
          type="button"
          onClick={() => setMode('choice')}
          className="flex items-center gap-1 text-sm text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 mb-2"
        >
          ← Back to options
        </button>

        <Input
          label="Project Name *"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Annual Fundraising Gala"
          fullWidth
        />

        <Textarea
          label="Description"
          rows={2}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the project..."
          fullWidth
        />

        <Select
          label="Organization *"
          required
          value={formData.clientId}
          onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
          options={[
            { value: '', label: 'Select an organization' },
            ...clients.map(client => ({ value: client.id, label: client.name }))
          ]}
          fullWidth
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date *"
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            fullWidth
          />
          <Input
            label="End Date *"
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            fullWidth
          />
        </div>

        <Select
          label="Initial Status"
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
          options={Object.values(ProjectStatus).map(status => ({ value: status, label: status }))}
          fullWidth
        />

        {/* Team Members */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assign Team Members</label>
          <div className="max-h-32 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-white dark:bg-slate-800">
            {teamMembers.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">No team members available</p>
            ) : (
              <div className="space-y-1">
                {teamMembers.map(member => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.teamMemberIds.includes(member.id)}
                      onChange={() => handleTeamMemberToggle(member.id)}
                      className="w-4 h-4 text-rose-500 rounded focus:ring-rose-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{member.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Initial Tasks */}
        <div>
          <Textarea
            label="Initial Tasks"
            helperText="One per line, optional"
            rows={4}
            value={formData.initialTasks}
            onChange={(e) => setFormData(prev => ({ ...prev, initialTasks: e.target.value }))}
            placeholder="Schedule kickoff meeting&#10;Create project timeline&#10;Send introduction emails&#10;Set up tracking system"
            fullWidth
          />
          {formData.initialTasks && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formData.initialTasks.split('\n').filter(line => line.trim()).length} task(s) will be created
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex items-center gap-2">
            <PlusIcon />
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
