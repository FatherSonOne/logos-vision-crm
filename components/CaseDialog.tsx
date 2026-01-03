import React, { useState, useEffect } from 'react';
import type { Case, Client, TeamMember } from '../types';
import { CaseStatus, CasePriority } from '../types';
import { Modal } from './Modal';
import { AiEnhancedTextarea } from './AiEnhancedTextarea';

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

// Priority styling using CMF tokens
const getPriorityStyles = (priority: CasePriority, isSelected: boolean) => {
  const configs: Record<CasePriority, { activeBg: string; text: string }> = {
    [CasePriority.Low]: { activeBg: 'var(--cmf-success-muted)', text: 'var(--cmf-success)' },
    [CasePriority.Medium]: { activeBg: 'var(--cmf-warning-muted)', text: 'var(--cmf-warning)' },
    [CasePriority.High]: { activeBg: 'var(--cmf-error-muted)', text: 'var(--cmf-error)' },
  };
  const config = configs[priority];
  return {
    backgroundColor: isSelected ? config.activeBg : 'transparent',
    color: isSelected ? config.text : 'var(--cmf-text-muted)',
    border: `1px solid ${isSelected ? config.text : 'var(--cmf-border)'}`,
  };
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

  // CMF Design Token styles for inputs
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--cmf-surface-2)',
    color: 'var(--cmf-text)',
    border: '1px solid var(--cmf-border)',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--cmf-text-secondary)',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={caseToEdit ? "Edit Case" : "Create New Case"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1.5" style={labelStyle}>Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Case title"
              className="w-full h-10 px-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cmf-accent)]"
              style={inputStyle}
            />
        </div>

        <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1.5" style={labelStyle}>Description</label>
            <AiEnhancedTextarea
                id="description"
                name="description"
                value={formData.description}
                onValueChange={(value) => handleTextareaChange('description', value)}
                rows={4}
                placeholder="Case description"
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cmf-accent)]"
                style={inputStyle}
            />
        </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="clientId" className="block text-sm font-medium mb-1.5" style={labelStyle}>Client Name</label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={clients.find(c => c.id === formData.clientId)?.name || ''}
                  disabled={true}
                  placeholder="Client organization"
                  className="w-full h-10 px-3 text-sm rounded-lg focus:outline-none disabled:opacity-60"
                  style={inputStyle}
                />
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  required
                  disabled={!!caseToEdit}
                  className="hidden"
                >
                    {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="assignedToId" className="block text-sm font-medium mb-1.5" style={labelStyle}>Assignee *</label>
                <select
                  id="assignedToId"
                  name="assignedToId"
                  value={formData.assignedToId}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cmf-accent)]"
                  style={inputStyle}
                >
                    {teamMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1.5" style={labelStyle}>Type</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-10 px-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cmf-accent)]"
                  style={inputStyle}
                >
                    {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Priority</label>
                <div className="flex gap-2">
                  {Object.values(CasePriority).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                      className="flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all"
                      style={getPriorityStyles(p, formData.priority === p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--cmf-divider)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--cmf-text)',
                border: '1px solid var(--cmf-border)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{
                backgroundColor: 'var(--cmf-accent)',
                color: 'white',
              }}
            >
              {caseToEdit ? 'Update Case' : 'Create Case'}
            </button>
        </div>
      </form>
    </Modal>
  );
};