import React, { useState, useEffect } from 'react';
import type { Case, Client, TeamMember } from '../types';
import { CaseStatus, CasePriority } from '../types';
import { Modal } from './Modal';
import { AiEnhancedTextarea } from './AiEnhancedTextarea';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface CaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (caseData: Omit<Case, 'createdAt' | 'lastUpdatedAt'> & { id?: string }) => void;
  clients: Client[];
  teamMembers: TeamMember[];
  caseToEdit?: Case | null;
}

const initialFormData = {
    title: "",
    description: "",
    clientId: "",
    assignedToId: "",
    status: CaseStatus.New,
    priority: CasePriority.Medium,
};

export const CaseDialog: React.FC<CaseDialogProps> = ({ isOpen, onClose, onSave, clients, teamMembers, caseToEdit }) => {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (isOpen) {
      if (caseToEdit) {
        setFormData({
            title: caseToEdit.title,
            description: caseToEdit.description,
            clientId: caseToEdit.clientId,
            assignedToId: caseToEdit.assignedToId,
            status: caseToEdit.status,
            priority: caseToEdit.priority,
        });
      } else {
        setFormData({ ...initialFormData, clientId: clients[0]?.id || '', assignedToId: teamMembers[0]?.id || '' });
      }
    }
  }, [isOpen, caseToEdit, clients, teamMembers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.clientId || !formData.assignedToId) {
        alert("Please fill in all required fields.");
        return;
    }
    onSave({
        ...formData,
        id: caseToEdit?.id,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTextareaChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={caseToEdit ? "Edit Case" : "Create New Case"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title *"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          fullWidth
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
          <AiEnhancedTextarea
            id="description"
            name="description"
            value={formData.description}
            onValueChange={(value) => handleTextareaChange('description', value)}
            rows={4}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:border-rose-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Client *"
            id="clientId"
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            required
            disabled={!!caseToEdit}
            options={clients.map(client => ({ value: client.id, label: client.name }))}
            fullWidth
          />
          <Select
            label="Assignee *"
            id="assignedToId"
            name="assignedToId"
            value={formData.assignedToId}
            onChange={handleChange}
            required
            options={teamMembers.map(member => ({ value: member.id, label: member.name }))}
            fullWidth
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={Object.values(CaseStatus).map(s => ({ value: s, label: s }))}
            fullWidth
          />
          <Select
            label="Priority"
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={Object.values(CasePriority).map(p => ({ value: p, label: p }))}
            fullWidth
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Case</Button>
        </div>
      </form>
    </Modal>
  );
};