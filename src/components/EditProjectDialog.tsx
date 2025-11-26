import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { Project, Client, TeamMember } from '../types';
import { ProjectStatus } from '../types';

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

  const inputClasses = "w-full px-3 py-2 bg-white/50 dark:bg-black/30 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-slate-800 dark:text-slate-100";
  const labelClasses = "block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1";

  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Project Name */}
        <div>
          <label className={labelClasses}>Project Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={inputClasses}
            placeholder="Enter project name"
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClasses}>Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className={inputClasses}
            placeholder="Project description..."
          />
        </div>

        {/* Client */}
        <div>
          <label className={labelClasses}>Organization *</label>
          <select
            required
            value={formData.clientId}
            onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
            className={inputClasses}
          >
            <option value="">Select an organization</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className={labelClasses}>Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
            className={inputClasses}
          >
            {Object.values(ProjectStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Start Date *</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>End Date *</label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Team Members */}
        <div>
          <label className={labelClasses}>Team Members</label>
          <div className="max-h-40 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-white/50 dark:bg-black/30">
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
                      className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
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
          <label className={labelClasses}>Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className={`${inputClasses} flex-1`}
              placeholder="Add a tag..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Add
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-cyan-900 dark:hover:text-cyan-100"
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
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all shadow-md"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};
