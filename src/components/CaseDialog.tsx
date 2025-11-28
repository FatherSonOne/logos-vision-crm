import React, { useState, useEffect } from 'react';
import type { Case, Client, TeamMember } from '../types';
import { CaseStatus, CasePriority } from '../types';
import { Modal } from './Modal';
import { AiEnhancedTextarea } from './AiEnhancedTextarea';
import { caseSchema } from '../utils/validations';
import { z } from 'zod';

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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setErrors({});

    try {
      const validData = caseSchema.parse({
        title: formData.title.trim(),
        description: formData.description.trim(),
        clientId: formData.clientId,
        assignedToId: formData.assignedToId,
        status: formData.status,
        priority: formData.priority,
      });

      onSave({
        ...validData,
        id: caseToEdit?.id,
      });
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTextareaChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const getInputStyles = (fieldName: string) => {
    const baseStyles = "w-full p-2 bg-slate-100 border rounded-md focus:ring-violet-500 focus:border-violet-500 text-slate-900 placeholder-slate-400";
    const errorStyles = errors[fieldName]
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-slate-300";
    return `${baseStyles} ${errorStyles}`;
  };

  const labelStyles = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={caseToEdit ? "Edit Case" : "Create New Case"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="title" className={labelStyles}>
              Case Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={getInputStyles('title')}
              placeholder="e.g., Client Portal Access Issue"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
        </div>

        <div>
            <label htmlFor="description" className={labelStyles}>
              Description <span className="text-red-500">*</span>
            </label>
            <AiEnhancedTextarea
                id="description"
                name="description"
                value={formData.description}
                onValueChange={(value) => handleTextareaChange('description', value)}
                rows={4}
                className={getInputStyles('description')}
                placeholder="Provide detailed information about the case..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
        </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="clientId" className={labelStyles}>
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  className={getInputStyles('clientId')}
                  disabled={!!caseToEdit}
                >
                    {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
                {errors.clientId && (
                  <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
                )}
            </div>
             <div>
                <label htmlFor="assignedToId" className={labelStyles}>
                  Assignee <span className="text-red-500">*</span>
                </label>
                <select
                  id="assignedToId"
                  name="assignedToId"
                  value={formData.assignedToId}
                  onChange={handleChange}
                  className={getInputStyles('assignedToId')}
                >
                    {teamMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
                {errors.assignedToId && (
                  <p className="mt-1 text-sm text-red-600">{errors.assignedToId}</p>
                )}
            </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="status" className={labelStyles}>Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={getInputStyles('status')}
                >
                    {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
            </div>
             <div>
                <label htmlFor="priority" className={labelStyles}>Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={getInputStyles('priority')}
                >
                    {Object.values(CasePriority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                )}
            </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-md text-sm font-semibold hover:from-indigo-700 hover:to-violet-700">Save Case</button>
        </div>
      </form>
    </Modal>
  );
};