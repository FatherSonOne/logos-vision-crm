import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { Project, Client, TeamMember } from '../types';
import { ProjectStatus } from '../types';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Input';
import { Select } from './ui/Select';

interface EditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  project: Project | null;
  clients: Client[];
  teamMembers: TeamMember[];
}

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  project,
  clients,
  teamMembers
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    teamMemberIds: [] as string[],
    startDate: '',
    endDate: '',
    status: ProjectStatus.Planning,
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  // Populate form when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        clientId: project.clientId,
        teamMemberIds: project.teamMemberIds || [],
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        tags: project.tags || [],
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    onSave({
      ...project,
      ...formData,
    });
    onClose();
  };

  const handleTeamMemberToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      teamMemberIds: prev.teamMemberIds.includes(memberId)
        ? prev.teamMemberIds.filter(id => id !== memberId)
        : [...prev.teamMemberIds, memberId]
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const inputClasses = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:border-rose-400";

  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Project Name *"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter project name"
          fullWidth
        />

        <Textarea
          label="Description"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Project description..."
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

        <Select
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
          options={Object.values(ProjectStatus).map(status => ({ value: status, label: status }))}
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

        {/* Team Members */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Team Members</label>
          <div className="max-h-40 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-white dark:bg-slate-800">
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{member.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">{member.role}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          {formData.teamMemberIds.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formData.teamMemberIds.length} member{formData.teamMemberIds.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className={`${inputClasses} flex-1`}
              placeholder="Add a tag..."
            />
            <Button type="button" variant="secondary" onClick={handleAddTag}>Add</Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-900 dark:hover:text-rose-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};
